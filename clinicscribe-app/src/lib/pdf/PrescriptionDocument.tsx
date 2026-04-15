import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';
import type { Patient, Prescription, PrescriptionItem } from '@/lib/types';

export interface PrescriptionDocumentProps {
  prescription: Prescription;
  patient: Patient;
  clinicianName: string;
  clinicName?: string;
  issuedDate: string;
}

const styles = StyleSheet.create({
  page: {
    paddingTop: 48,
    paddingBottom: 72,
    paddingHorizontal: 48,
    fontSize: 11,
    fontFamily: 'Helvetica',
    color: '#1c1c19',
    lineHeight: 1.45,
  },
  header: {
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#001736',
    borderBottomStyle: 'solid',
  },
  clinicName: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: '#001736',
  },
  heading: {
    marginTop: 4,
    fontSize: 12,
    color: '#43474f',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  twoCol: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 18,
  },
  col: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f6f7fb',
    borderRadius: 4,
  },
  colLabel: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#43474f',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  colValue: {
    fontSize: 11,
    color: '#1c1c19',
  },
  allergyBanner: {
    marginBottom: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fdecea',
    borderWidth: 1,
    borderColor: '#c62828',
    borderStyle: 'solid',
    borderRadius: 4,
  },
  allergyLabel: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#b71c1c',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 2,
  },
  allergyText: {
    fontSize: 11,
    color: '#b71c1c',
    fontFamily: 'Helvetica-Bold',
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#001736',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
    marginTop: 8,
  },
  itemBlock: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#c4c6d0',
    borderStyle: 'solid',
    borderRadius: 4,
  },
  itemName: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#1c1c19',
    marginBottom: 4,
  },
  itemDetail: {
    fontSize: 10,
    color: '#43474f',
    marginBottom: 2,
  },
  itemInstructions: {
    fontSize: 10,
    color: '#2e2f30',
    marginTop: 4,
    fontStyle: 'italic',
  },
  notes: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f6f7fb',
    borderRadius: 4,
    fontSize: 10,
    color: '#43474f',
  },
  signatureBlock: {
    marginTop: 28,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#c4c6d0',
    borderTopStyle: 'solid',
  },
  signatureLine: {
    marginTop: 24,
    height: 1,
    backgroundColor: '#1c1c19',
    width: 220,
  },
  signatureLabel: {
    marginTop: 4,
    fontSize: 9,
    color: '#43474f',
  },
  footer: {
    position: 'absolute',
    bottom: 36,
    left: 48,
    right: 48,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#c4c6d0',
    borderTopStyle: 'solid',
    fontSize: 8,
    color: '#747780',
    textAlign: 'center',
  },
});

function formatDob(dob: string | null | undefined) {
  if (!dob) return '—';
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return dob;
  return d.toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function ItemRow({ item, index }: { item: PrescriptionItem; index: number }) {
  const qty = item.quantity != null ? `Qty ${item.quantity}` : null;
  const repeats = item.repeats != null ? `${item.repeats} repeat${item.repeats === 1 ? '' : 's'}` : null;
  const duration = item.duration ? `Duration ${item.duration}` : null;
  const summary = [qty, repeats, duration].filter(Boolean).join(' · ');
  const nameLine = [item.name, item.strength, item.form].filter(Boolean).join(' ');
  return (
    <View style={styles.itemBlock} wrap={false}>
      <Text style={styles.itemName}>
        {index + 1}. {nameLine || 'Medication'}
      </Text>
      <Text style={styles.itemDetail}>
        {item.dose || '—'} · {item.frequency || '—'}
      </Text>
      {summary ? <Text style={styles.itemDetail}>{summary}</Text> : null}
      {item.instructions ? (
        <Text style={styles.itemInstructions}>{item.instructions}</Text>
      ) : null}
    </View>
  );
}

export function PrescriptionDocument({
  prescription,
  patient,
  clinicianName,
  clinicName = 'Miraa',
  issuedDate,
}: PrescriptionDocumentProps) {
  const patientName = `${patient.first_name} ${patient.last_name}`;
  const allergies = (patient.allergies ?? []).filter(Boolean);
  return (
    <Document
      title={`Prescription — ${patientName}`}
      author={clinicianName}
      creator={clinicName}
      producer="Miraa ClinicScribe"
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.clinicName}>{clinicName}</Text>
          <Text style={styles.heading}>Draft Prescription</Text>
        </View>

        <View style={styles.twoCol}>
          <View style={styles.col}>
            <Text style={styles.colLabel}>Prescriber</Text>
            <Text style={styles.colValue}>{clinicianName}</Text>
            <Text style={styles.colValue}>Registration #: _______</Text>
          </View>
          <View style={styles.col}>
            <Text style={styles.colLabel}>Issued</Text>
            <Text style={styles.colValue}>{issuedDate}</Text>
            <Text style={styles.colValue}>Status: {prescription.status}</Text>
          </View>
        </View>

        <View style={styles.twoCol}>
          <View style={styles.col}>
            <Text style={styles.colLabel}>Patient</Text>
            <Text style={styles.colValue}>{patientName}</Text>
            <Text style={styles.colValue}>DOB: {formatDob(patient.date_of_birth)}</Text>
            {patient.mrn ? (
              <Text style={styles.colValue}>MRN: {patient.mrn}</Text>
            ) : null}
          </View>
          <View style={styles.col}>
            <Text style={styles.colLabel}>Conditions</Text>
            <Text style={styles.colValue}>
              {(patient.conditions ?? []).filter(Boolean).join(', ') || 'None recorded'}
            </Text>
          </View>
        </View>

        {allergies.length > 0 && (
          <View style={styles.allergyBanner}>
            <Text style={styles.allergyLabel}>Allergies</Text>
            <Text style={styles.allergyText}>{allergies.join(', ')}</Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>Medications</Text>
        {prescription.items.length === 0 ? (
          <Text style={styles.itemDetail}>No medications drafted.</Text>
        ) : (
          prescription.items.map((item, i) => (
            <ItemRow key={`rx-${i}`} item={item} index={i} />
          ))
        )}

        {prescription.notes ? (
          <View style={styles.notes}>
            <Text>{prescription.notes}</Text>
          </View>
        ) : null}

        <View style={styles.signatureBlock}>
          <View style={styles.signatureLine} />
          <Text style={styles.signatureLabel}>
            Prescriber signature — {clinicianName}, {issuedDate}
          </Text>
        </View>

        <Text style={styles.footer} fixed>
          Draft prescription generated with AI assistance. Not valid without
          clinician signature. Clinician-reviewed before dispense.
        </Text>
      </Page>
    </Document>
  );
}
