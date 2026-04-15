import React from 'react';
import { NextResponse } from 'next/server';
import { renderToBuffer, type DocumentProps } from '@react-pdf/renderer';
import { createClient } from '@/lib/supabase/server';
import { PrescriptionDocument } from '@/lib/pdf/PrescriptionDocument';
import type { Patient, Prescription } from '@/lib/types';

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
    if (user?.id) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, clinic:clinics(name)')
        .eq('user_id', user.id)
        .maybeSingle();
      if (profile) {
        profileId = profile.id;
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

    // Best-effort audit log — don't fail the download if logging fails.
    if (typedPrescription.clinical_note_id && profileId) {
      try {
        const { error: insertError } = await supabase
          .from('export_records')
          .insert({
            consultation_id: consultationId,
            note_id: typedPrescription.clinical_note_id,
            format: 'pdf',
            file_path: null,
            exported_by: profileId,
          });
        if (insertError) {
          console.warn('prescription export_records insert failed:', insertError.message);
        }
      } catch (logError) {
        console.warn('prescription export_records audit log skipped:', logError);
      }
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
    console.error('Prescription PDF error:', error);
    const message = error instanceof Error ? error.message : 'Failed to render prescription';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
