import React from 'react';
import { NextResponse } from 'next/server';
import { renderToBuffer, type DocumentProps } from '@react-pdf/renderer';
import { createClient } from '@/lib/supabase/server';
import { PrescriptionDocument } from '@/lib/pdf/PrescriptionDocument';
import type { Patient, Prescription } from '@/lib/types';
import {
  checkOrigin,
  forbidden,
  getRequestIp,
  logError,
  writeAuditLog,
} from '@/lib/apiSecurity';

function sanitize(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[^\w\-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase() || 'prescription';
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  if (!checkOrigin(request)) return forbidden('Invalid origin');
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

    const supabase = await createClient();

    const { data: prescription, error: rxError } = await supabase
      .from('prescriptions')
      .select('*, patient:patients(*)')
      .eq('id', body.prescriptionId)
      .maybeSingle();

    if (rxError) {
      return NextResponse.json({ error: rxError.message }, { status: 500 });
    }
    if (!prescription) {
      return NextResponse.json({ error: 'Prescription not found' }, { status: 404 });
    }

    const typedPrescription = prescription as unknown as Prescription & {
      patient: Patient | null;
    };
    if (!typedPrescription.patient) {
      return NextResponse.json({ error: 'Patient context missing' }, { status: 400 });
    }
    if (typedPrescription.consultation_id && typedPrescription.consultation_id !== consultationId) {
      return NextResponse.json(
        { error: 'Prescription does not belong to this consultation' },
        { status: 400 }
      );
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    let clinicianName = 'Clinician';
    let clinicName = 'Miraa';
    let profileId: string | null = null;
    let clinicId: string | null = null;
    if (user?.id) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, clinic_id, first_name, last_name, clinic:clinics(name)')
        .eq('user_id', user.id)
        .maybeSingle();
      if (profile) {
        profileId = profile.id;
        clinicId = profile.clinic_id;
        clinicianName = `Dr. ${profile.first_name} ${profile.last_name}`;
        const clinic = profile.clinic as { name?: string } | { name?: string }[] | null;
        if (Array.isArray(clinic)) {
          clinicName = clinic[0]?.name ?? clinicName;
        } else if (clinic && typeof clinic === 'object' && 'name' in clinic && clinic.name) {
          clinicName = clinic.name;
        }
      }
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
    if (typedPrescription.clinical_note_id && profileId) {
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
    if (clinicId && user?.id) {
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
    }

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
