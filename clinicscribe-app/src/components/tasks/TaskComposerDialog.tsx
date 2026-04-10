'use client';

import { useEffect, useState } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { SearchInput } from '@/components/ui/SearchInput';
import { Button } from '@/components/ui/Button';
import { getPatients } from '@/lib/api/patients';
import { getConsultationsForPatient } from '@/lib/api/consultations';
import { createCareTask } from '@/lib/api/workflow';
import { CARE_TASK_CATEGORY_LABELS } from '@/lib/constants';
import type { CareTask, CareTaskCategory, Consultation, Patient } from '@/lib/types';
import { formatDateTime } from '@/lib/utils';

interface TaskComposerDialogProps {
  open: boolean;
  clinicId: string | null | undefined;
  ownerUserId?: string | null;
  onClose: () => void;
  onCreated: (task: CareTask) => void;
}

export function TaskComposerDialog({
  open,
  clinicId,
  ownerUserId,
  onClose,
  onCreated,
}: TaskComposerDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<CareTaskCategory>('follow_up');
  const [dueDate, setDueDate] = useState('');
  const [patientQuery, setPatientQuery] = useState('');
  const [patientResults, setPatientResults] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [selectedConsultationId, setSelectedConsultationId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setTitle('');
      setDescription('');
      setCategory('follow_up');
      setDueDate('');
      setPatientQuery('');
      setPatientResults([]);
      setSelectedPatient(null);
      setConsultations([]);
      setSelectedConsultationId('');
      setError(null);
      setIsSubmitting(false);
    }
  }, [open]);

  async function handlePatientSearch(value: string) {
    setPatientQuery(value);
    if (!clinicId || value.trim().length < 2) {
      setPatientResults([]);
      return;
    }

    try {
      const results = await getPatients(clinicId, value.trim());
      setPatientResults(results.slice(0, 6));
    } catch {
      setPatientResults([]);
    }
  }

  async function handleSelectPatient(patient: Patient) {
    if (!clinicId) return;
    setSelectedPatient(patient);
    setPatientQuery(`${patient.first_name} ${patient.last_name}`);
    setPatientResults([]);
    setSelectedConsultationId('');

    try {
      const nextConsultations = await getConsultationsForPatient(clinicId, patient.id);
      setConsultations(nextConsultations);
    } catch {
      setConsultations([]);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!clinicId || !selectedPatient || !selectedConsultationId || !title.trim()) {
      setError('Title, patient, and linked consultation are required.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const task = await createCareTask({
        clinicId,
        patientId: selectedPatient.id,
        consultationId: selectedConsultationId,
        title: title.trim(),
        description: description.trim(),
        dueAt: dueDate ? new Date(`${dueDate}T09:00:00`).toISOString() : null,
        category,
        ownerUserId: ownerUserId ?? null,
      });
      onCreated(task);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} title="Create Task" className="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          id="task-title"
          label="Task title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="e.g. Review renal panel in 1 week"
        />

        <Textarea
          id="task-description"
          label="Description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Add any detail the clinician needs to act on this."
        />

        <div className="grid gap-4 md:grid-cols-2">
          <Select
            id="task-category"
            label="Category"
            value={category}
            onChange={(event) => setCategory(event.target.value as CareTaskCategory)}
            options={Object.entries(CARE_TASK_CATEGORY_LABELS).map(([value, label]) => ({
              value,
              label,
            }))}
          />
          <Input
            id="task-due-date"
            type="date"
            label="Due date"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
          />
        </div>

        <div className="space-y-3">
          <div>
            <p className="mb-1.5 text-sm font-medium text-on-surface">Patient</p>
            <SearchInput
              value={patientQuery}
              onSearch={handlePatientSearch}
              placeholder="Search by patient name or MRN"
            />
          </div>

          {patientResults.length > 0 ? (
            <div className="rounded-2xl border border-outline-variant/40 bg-surface-container-low">
              {patientResults.map((patient) => (
                <button
                  key={patient.id}
                  type="button"
                  onClick={() => handleSelectPatient(patient)}
                  className="flex w-full items-center justify-between border-b border-outline-variant/30 px-4 py-3 text-left text-sm last:border-b-0 hover:bg-surface-container"
                >
                  <span className="font-medium text-on-surface">
                    {patient.first_name} {patient.last_name}
                  </span>
                  <span className="text-on-surface-variant">{patient.mrn || 'No MRN'}</span>
                </button>
              ))}
            </div>
          ) : null}

          {selectedPatient ? (
            <div className="rounded-2xl border border-secondary/20 bg-secondary/8 px-4 py-3 text-sm">
              <p className="font-semibold text-on-surface">
                {selectedPatient.first_name} {selectedPatient.last_name}
              </p>
              <p className="mt-1 text-on-surface-variant">
                Linked MRN: {selectedPatient.mrn || 'No MRN recorded'}
              </p>
            </div>
          ) : null}
        </div>

        <Select
          id="task-consultation"
          label="Linked consultation"
          value={selectedConsultationId}
          onChange={(event) => setSelectedConsultationId(event.target.value)}
          placeholder="Choose a consultation"
          options={consultations.map((consultation) => ({
            value: consultation.id,
            label: `${consultation.consultation_type} · ${formatDateTime(consultation.created_at)}`,
          }))}
        />

        {selectedPatient && consultations.length === 0 ? (
          <p className="text-sm text-on-surface-variant">
            This patient has no consultations yet. Create a consultation first, then attach the task.
          </p>
        ) : null}

        {error ? <p className="text-sm text-error">{error}</p> : null}

        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting} disabled={!clinicId}>
            Create task
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
