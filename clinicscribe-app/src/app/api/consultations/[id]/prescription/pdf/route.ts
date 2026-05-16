import React from 'react';
import { NextResponse } from 'next/server';
import { renderToBuffer, type DocumentProps } from '@react-pdf/renderer';
import { PrescriptionDocument } from '@/lib/pdf/PrescriptionDocument';
import type { Patient, Prescription } from '@/lib/types';
import {
  checkOrigin,
  forbidden,
  getRequestIp,
  logError,
  notFound,
  rateLimit,
  requireCallerClinic,
  requireUser,
  tooMany,
  writeAuditLog,
} from '@/lib/apiSecurity';

const MAX_FILENAME_SLUG_LENGTH = 60;

function sanitize(input: string): string {
  const slug =
    input
      .normalize('NFKD')
      .replace(/[^\w\-]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .toLowerCase() || 'prescription';
  // Cap to keep `Content-Disposition` headers and filesystem paths sane.
  return slug.length > MAX_FILENAME_SLUG_LENGTH
    ? slug.slice(0, MAX_FILENAME_SLUG_LENGTH)
    : slug;
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  if (!checkOrigin(request)) return forbidden('Invalid origin');

  const { user, supabase, response: authError } = await requireUser();
  if (authError) return authError;
  if (!(await rateLimit(`prescription-pdf:${user.id}`, 30, 60_000))) return tooMany();

  try {
    const { id: consultationId } = await context.params;
    const body = (await request.json().catch(() => ({}))) as {
      prescriptionId?: string;
    };
    if (!body.prescriptionId) {
      return NextResponse.json(
        { error: 'prescriptionId is required' },
        { status: 400 }
      );
    }

    // Caller's profile + clinic — required to scope every read below.
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, clinic_id, first_name, last_name, clinic:clinics(name)')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!profile) return forbidden();

    const profileId: string = profile.id;
    const clinicId: string = profile.clinic_id;
    const clinicianName = `Dr. ${profile.first_name} ${profile.last_name}`;
    let clinicName = 'Miraa';
    const clinic = profile.clinic as { name?: string } | { name?: string }[] | null;
    if (Array.isArray(clinic)) {
      clinicName = clinic[0]?.name ?? clinicName;
    } else if (clinic && typeof clinic === 'object' && 'name' in clinic && clinic.name) {
      clinicName = clinic.name;
    }

    const { data: prescription, error: rxError } = await supabase
      .from('prescriptions')
      .select('*, patient:patients(*)')
      .eq('id', body.prescriptionId)
      .maybeSingle();

    if (rxError) {
      logError('prescription-pdf-load', rxError);
      return NextResponse.json({ error: 'Failed to load prescription' }, { status: 500 });
    }
    if (!prescription) return notFound('Prescription not found');

    const typedPrescription = prescription as unknown as Prescription & {
      patient: Patient | null;
    };

    // Cross-clinic enforcement: prescription must belong to this clinic AND
    // (if present) must reference the consultation in the URL.
    if (typedPrescription.clinic_id !== clinicId) {
      return notFound('Prescription not found');
    }
    if (typedPrescription.consultation_id && typedPrescription.consultation_id !== consultationId) {
      return notFound('Prescription not found');
    }
    if (!typedPrescription.patient) {
      return NextResponse.json({ error: 'Patient context missing' }, { status: 400 });
    }
    if (typedPrescription.patient.clinic_id !== clinicId) {
      return notFound('Prescription not found');
    }

    const issuedDate = new Date().toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const documentElement = React.createElement(PrescriptionDocument, {
      prescription: typedPrescription,
      patient: typedPrescription.patient,
      clinicianName,
      clinicName,
      issuedDate,
    }) as unknown as React.ReactElement<DocumentProps>;
    const buffer = await renderToBuffer(documentElement);

    // Best-effort export_records insert (legacy/UI surface).
    if (typedPrescription.clinical_note_id) {
      const { error: insertError } = await supabase
        .from('export_records')
        .insert({
          consultation_id: consultationId,
          note_id: typedPrescription.clinical_note_id,
          format: 'pdf',
          file_path: null,
          exported_by: profileId,
        });
      if (insertError) logError('prescription-pdf-export-record', insertError);
    }

    // Non-repudiation audit trail for PHI export.
    await writeAuditLog(supabase, {
      clinicId,
      userId: user.id,
      action: 'prescription.export',
      entityType: 'prescription',
      entityId: typedPrescription.id,
      details: {
        format: 'pdf',
        consultation_id: consultationId,
        patient_id: typedPrescription.patient.id,
      },
      ipAddress: getRequestIp(request),
    });

    // Flip to 'printed' on first successful render, but don't clobber dispensed/void.
    if (typedPrescription.status === 'approved') {
      await supabase
        .from('prescriptions')
        .update({ status: 'printed', updated_at: new Date().toISOString() })
        .eq('id', typedPrescription.id);
    }

    const slug = sanitize(
      `${typedPrescription.patient.last_name}-${typedPrescription.patient.first_name}`
    );
    const dateSlug = new Date().toISOString().split('T')[0];
    const filename = `prescription-${slug}-${dateSlug}.pdf`;

    return new NextResponse(buffer as unknown as BodyInit, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    logError('prescription-pdf', error);
    return NextResponse.json({ error: 'Failed to render prescription' }, { status: 500 });
  }
}
