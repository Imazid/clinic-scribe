import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';
import type { FollowUpTask, MedicationDraft, SOAPNote } from '@/lib/types';

export interface ClinicalNoteDocumentProps {
  content: SOAPNote;
  patientName: string;
  consultationDate: string;
  clinicianName: string;
  clinicName?: string;
  medications?: MedicationDraft[];
  followUpTasks?: FollowUpTask[];
  referrals?: string[];
}

const styles = StyleSheet.create({
  page: {
    paddingTop: 48,
    paddingBottom: 56,
    paddingHorizontal: 48,
    fontSize: 11,
    fontFamily: 'Helvetica',
    color: '#1c1c19',
    lineHeight: 1.5,
  },
  headerBlock: {
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#c4c6d0',
    borderBottomStyle: 'solid',
  },
  title: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: '#001736',
    marginBottom: 4,
  },
  meta: {
    fontSize: 10,
    color: '#43474f',
  },
  disclaimer: {
    marginBottom: 18,
    padding: 10,
    backgroundColor: '#fff8e1',
    borderWidth: 1,
    borderColor: '#f5c518',
    borderStyle: 'solid',
    borderRadius: 4,
    fontSize: 9,
    color: '#5c4a00',
  },
  section: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#001736',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
    paddingBottom: 3,
    borderBottomWidth: 1,
    borderBottomColor: '#e3e5ec',
    borderBottomStyle: 'solid',
  },
  sectionBody: {
    fontSize: 11,
    color: '#2e2f30',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f2f3f7',
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#c4c6d0',
    borderBottomStyle: 'solid',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 5,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#eceef3',
    borderBottomStyle: 'solid',
  },
  th: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#43474f',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  td: {
    fontSize: 10,
    color: '#2e2f30',
  },
  colMed: { flexBasis: '34%', flexGrow: 0, flexShrink: 0 },
  colDose: { flexBasis: '20%', flexGrow: 0, flexShrink: 0 },
  colFreq: { flexBasis: '26%', flexGrow: 0, flexShrink: 0 },
  colQty: { flexBasis: '12%', flexGrow: 0, flexShrink: 0 },
  colVer: { flexBasis: '8%', flexGrow: 0, flexShrink: 0, textAlign: 'right' },
  listItem: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  bullet: {
    width: 10,
    fontSize: 11,
  },
  listText: {
    flex: 1,
    fontSize: 11,
    color: '#2e2f30',
  },
  footer: {
    position: 'absolute',
    bottom: 32,
    left: 48,
    right: 48,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#c4c6d0',
    borderTopStyle: 'solid',
    fontSize: 9,
    color: '#747780',
    textAlign: 'center',
  },
});

function Section({ title, body }: { title: string; body: string }) {
  return (
    <View style={styles.section} wrap={false}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionBody}>{body || '—'}</Text>
    </View>
  );
}

export function ClinicalNoteDocument({
  content,
  patientName,
  consultationDate,
  clinicianName,
  clinicName = 'Miraa',
  medications = [],
  followUpTasks = [],
  referrals = [],
}: ClinicalNoteDocumentProps) {
  return (
    <Document
      title={`Clinical Note — ${patientName}`}
      author={clinicianName}
      creator={clinicName}
      producer="Miraa ClinicScribe"
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.headerBlock}>
          <Text style={styles.title}>Clinical Note — {patientName}</Text>
          <Text style={styles.meta}>
            {consultationDate} · {clinicianName} · {clinicName}
          </Text>
        </View>

        <View style={styles.disclaimer}>
          <Text>
            This note was generated with AI assistance. All content has been
            reviewed and approved by the treating clinician before finalisation.
          </Text>
        </View>

        <Section title="Subjective" body={content.subjective} />
        <Section title="Objective" body={content.objective} />
        <Section title="Assessment" body={content.assessment} />
        <Section title="Plan" body={content.plan} />

        {medications.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Medications (Draft — Requires Clinician Verification)
            </Text>
            <View style={styles.tableHeader}>
              <Text style={[styles.th, styles.colMed]}>Medication</Text>
              <Text style={[styles.th, styles.colDose]}>Dose</Text>
              <Text style={[styles.th, styles.colFreq]}>Frequency</Text>
              <Text style={[styles.th, styles.colQty]}>Qty</Text>
              <Text style={[styles.th, styles.colVer]}>Verified</Text>
            </View>
            {medications.map((m, i) => (
              <View key={`${m.name}-${i}`} style={styles.tableRow} wrap={false}>
                <Text style={[styles.td, styles.colMed]}>{m.name || '—'}</Text>
                <Text style={[styles.td, styles.colDose]}>{m.dose || '—'}</Text>
                <Text style={[styles.td, styles.colFreq]}>{m.frequency || '—'}</Text>
                <Text style={[styles.td, styles.colQty]}>{m.quantity || '—'}</Text>
                <Text style={[styles.td, styles.colVer]}>{m.verified ? '✓' : '—'}</Text>
              </View>
            ))}
          </View>
        )}

        {followUpTasks.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Follow-Up Tasks</Text>
            {followUpTasks.map((task, i) => (
              <View key={`fu-${i}`} style={styles.listItem} wrap={false}>
                <Text style={styles.bullet}>{task.completed ? '✓' : '○'}</Text>
                <Text style={styles.listText}>
                  {task.description}
                  {task.due_date ? ` (due ${task.due_date})` : ''}
                </Text>
              </View>
            ))}
          </View>
        )}

        {referrals.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Referrals</Text>
            {referrals.map((ref, i) => (
              <View key={`ref-${i}`} style={styles.listItem} wrap={false}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.listText}>{ref}</Text>
              </View>
            ))}
          </View>
        )}

        <Text style={styles.footer} fixed>
          Clinical note approved by {clinicianName} on {consultationDate}. Generated by
          {' '}
          {clinicName}. All AI-generated content reviewed by the treating clinician
          before finalisation.
        </Text>
      </Page>
    </Document>
  );
}
