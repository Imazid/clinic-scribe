'use client';

import { useEffect, useState } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Plus, Trash2, Pill } from 'lucide-react';
import type { MedicationDraft, Prescription, PrescriptionItem } from '@/lib/types';
import {
  approvePrescription,
  createPrescriptionDraft,
  createPrescriptionItemFromDraft,
  updatePrescription,
} from '@/lib/api/prescriptions';
import { useUIStore } from '@/lib/stores/ui-store';

interface PrescriptionDraftSheetProps {
  open: boolean;
  onClose: () => void;
  clinicId: string;
  patientId: string;
  consultationId: string;
  clinicalNoteId: string | null;
  profileId: string | null;
  medications: MedicationDraft[];
  existing?: Prescription | null;
  onSaved?: (prescription: Prescription) => void;
}

function emptyItem(): PrescriptionItem {
  return {
    name: '',
    strength: null,
    form: null,
    dose: '',
    frequency: '',
    duration: null,
    quantity: null,
    repeats: null,
    instructions: null,
  };
}

function seedFromMedications(meds: MedicationDraft[]): PrescriptionItem[] {
  if (!meds.length) return [emptyItem()];
  return meds.map((m) =>
    createPrescriptionItemFromDraft({
      name: m.name,
      dose: m.dose,
      frequency: m.frequency,
      quantity: m.quantity,
    })
  );
}

export function PrescriptionDraftSheet({
  open,
  onClose,
  clinicId,
  patientId,
  consultationId,
  clinicalNoteId,
  profileId,
  medications,
  existing,
  onSaved,
}: PrescriptionDraftSheetProps) {
  const addToast = useUIStore((s) => s.addToast);
  const [items, setItems] = useState<PrescriptionItem[]>(() =>
    existing?.items?.length ? existing.items : seedFromMedications(medications)
  );
  const [notes, setNotes] = useState<string>(existing?.notes ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [prescriptionId, setPrescriptionId] = useState<string | null>(existing?.id ?? null);

  useEffect(() => {
    if (!open) return;
    setItems(existing?.items?.length ? existing.items : seedFromMedications(medications));
    setNotes(existing?.notes ?? '');
    setPrescriptionId(existing?.id ?? null);
  }, [open, existing, medications]);

  function updateItem<K extends keyof PrescriptionItem>(
    index: number,
    key: K,
    value: PrescriptionItem[K]
  ) {
    setItems((current) => current.map((item, i) => (i === index ? { ...item, [key]: value } : item)));
  }

  function addItem() {
    setItems((current) => [...current, emptyItem()]);
  }

  function removeItem(index: number) {
    setItems((current) => (current.length <= 1 ? current : current.filter((_, i) => i !== index)));
  }

  function numericOrNull(value: string): number | null {
    const n = Number(value);
    return Number.isFinite(n) && value.trim() !== '' ? n : null;
  }

  async function persist(): Promise<Prescription | null> {
    const cleaned = items
      .map((item) => ({
        ...item,
        name: item.name.trim(),
        dose: item.dose.trim(),
        frequency: item.frequency.trim(),
      }))
      .filter((item) => item.name.length > 0);

    if (cleaned.length === 0) {
      addToast('Add at least one medication before saving', 'warning');
      return null;
    }

    try {
      if (prescriptionId) {
        const updated = await updatePrescription(prescriptionId, {
          items: cleaned,
          notes: notes.trim() || null,
        });
        return updated;
      }
      const created = await createPrescriptionDraft({
        clinicId,
        patientId,
        consultationId,
        clinicalNoteId,
        items: cleaned,
        notes: notes.trim() || null,
        draftedBy: profileId,
      });
      setPrescriptionId(created.id);
      return created;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save prescription';
      addToast(message, 'error');
      return null;
    }
  }

  async function handleSave() {
    setIsSaving(true);
    try {
      const saved = await persist();
      if (saved) {
        addToast('Prescription draft saved', 'success');
        onSaved?.(saved);
      }
    } finally {
      setIsSaving(false);
    }
  }

  async function handleApproveAndPrint() {
    setIsApproving(true);
    try {
      const saved = await persist();
      if (!saved) return;
      const approved = await approvePrescription(saved.id, profileId);
      onSaved?.(approved);

      const res = await fetch(
        `/api/consultations/${consultationId}/prescription/pdf`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prescriptionId: approved.id }),
        }
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'PDF render failed' }));
        throw new Error(err.error || 'PDF render failed');
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `prescription-${consultationId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      addToast('Prescription approved and PDF downloaded', 'success');
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to approve prescription';
      addToast(message, 'error');
    } finally {
      setIsApproving(false);
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Draft prescription"
      className="max-w-3xl"
    >
      <div className="space-y-5">
        <p className="text-sm text-on-surface-variant">
          Review the medications extracted from the consultation, fill in missing
          dose details, then save a draft or approve and download the PDF. All
          prescriptions are clinician-reviewed before dispense.
        </p>

        <div className="space-y-4">
          {items.map((item, index) => (
            <div
              key={`rx-item-${index}`}
              className="rounded-xl border border-outline-variant/40 bg-surface-container-low p-4"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-on-surface">
                  <Pill className="w-4 h-4 text-secondary" />
                  Medication {index + 1}
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="text-xs text-error hover:underline flex items-center gap-1 disabled:opacity-40"
                  disabled={items.length <= 1}
                >
                  <Trash2 className="w-3 h-3" />
                  Remove
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Input
                  label="Name"
                  value={item.name}
                  onChange={(e) => updateItem(index, 'name', e.target.value)}
                  placeholder="e.g. Amoxicillin"
                />
                <Input
                  label="Strength"
                  value={item.strength ?? ''}
                  onChange={(e) => updateItem(index, 'strength', e.target.value || null)}
                  placeholder="e.g. 500mg"
                />
                <Input
                  label="Form"
                  value={item.form ?? ''}
                  onChange={(e) => updateItem(index, 'form', e.target.value || null)}
                  placeholder="e.g. tablet"
                />
                <Input
                  label="Dose"
                  value={item.dose}
                  onChange={(e) => updateItem(index, 'dose', e.target.value)}
                  placeholder="e.g. 1 tablet"
                />
                <Input
                  label="Frequency"
                  value={item.frequency}
                  onChange={(e) => updateItem(index, 'frequency', e.target.value)}
                  placeholder="e.g. TDS"
                />
                <Input
                  label="Duration"
                  value={item.duration ?? ''}
                  onChange={(e) => updateItem(index, 'duration', e.target.value || null)}
                  placeholder="e.g. 7 days"
                />
                <Input
                  label="Quantity"
                  type="number"
                  value={item.quantity ?? ''}
                  onChange={(e) => updateItem(index, 'quantity', numericOrNull(e.target.value))}
                  placeholder="e.g. 21"
                />
                <Input
                  label="Repeats"
                  type="number"
                  value={item.repeats ?? ''}
                  onChange={(e) => updateItem(index, 'repeats', numericOrNull(e.target.value))}
                  placeholder="e.g. 0"
                />
              </div>

              <div className="mt-3">
                <Textarea
                  label="Instructions"
                  value={item.instructions ?? ''}
                  onChange={(e) => updateItem(index, 'instructions', e.target.value || null)}
                  placeholder="e.g. Take with food"
                  rows={2}
                />
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addItem}
            className="flex items-center gap-2 text-sm text-secondary hover:underline"
          >
            <Plus className="w-4 h-4" />
            Add another medication
          </button>
        </div>

        <Textarea
          label="Notes to prescriber"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Optional notes to include on the printed prescription"
          rows={3}
        />

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={onClose} disabled={isSaving || isApproving}>
            Cancel
          </Button>
          <Button variant="outline" onClick={handleSave} isLoading={isSaving} disabled={isApproving}>
            Save draft
          </Button>
          <Button onClick={handleApproveAndPrint} isLoading={isApproving} disabled={isSaving}>
            Approve &amp; generate PDF
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
