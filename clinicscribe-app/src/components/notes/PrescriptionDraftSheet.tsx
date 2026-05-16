'use client';

import { useEffect, useRef, useState } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Loader2, Plus, Sparkles, Trash2 } from 'lucide-react';
import type { MedicationDraft, Prescription, PrescriptionItem } from '@/lib/types';
import {
  approvePrescription,
  createPrescriptionDraft,
  createPrescriptionItemFromDraft,
  generateAIPrescriptionDraft,
  updatePrescription,
} from '@/lib/api/prescriptions';
import { useUIStore } from '@/lib/stores/ui-store';
import { cn } from '@/lib/utils';

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

/* ────────────────────────────────────────────────
   AI draft banner — top-of-dialog status surface
   ──────────────────────────────────────────────── */
function AIDraftBanner({
  isDrafting,
  error,
  aiCount,
  totalItems,
  onRegenerate,
}: {
  isDrafting: boolean;
  error: string | null;
  aiCount: number;
  totalItems: number;
  onRegenerate: () => void;
}) {
  if (isDrafting) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-tertiary/30 bg-tertiary/10 px-4 py-3">
        <Loader2 className="h-4 w-4 shrink-0 animate-spin text-tertiary" />
        <p className="text-sm text-on-surface">
          Drafting prescription from consultation…
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-start justify-between gap-3 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-warning">
            <Sparkles className="h-3 w-3" /> AI draft
          </p>
          <p className="mt-1 text-sm text-on-surface">{error}</p>
        </div>
        <button
          type="button"
          onClick={onRegenerate}
          className="shrink-0 rounded-lg border border-warning/40 bg-surface-container-lowest px-3 py-1.5 text-xs font-semibold text-warning transition-colors hover:bg-warning/5"
        >
          Try again
        </button>
      </div>
    );
  }

  if (aiCount === 0) {
    // Idle state — useful when re-opening a previously-saved prescription.
    return (
      <div className="flex items-center justify-between gap-3 rounded-xl border border-outline-variant/40 bg-surface-container-low px-4 py-3">
        <div className="flex items-center gap-2 text-sm text-on-surface-variant">
          <Sparkles className="h-4 w-4 text-secondary" />
          Draft a prescription with AI from this consultation
        </div>
        <button
          type="button"
          onClick={onRegenerate}
          className="shrink-0 rounded-lg border border-secondary/30 bg-surface-container-lowest px-3 py-1.5 text-xs font-semibold text-secondary transition-colors hover:bg-secondary/5"
        >
          Generate
        </button>
      </div>
    );
  }

  // Success — at least one item still flagged as AI-filled.
  return (
    <div className="flex items-start justify-between gap-3 rounded-xl border border-tertiary/30 bg-tertiary/5 px-4 py-3">
      <div className="min-w-0">
        <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-tertiary">
          <Sparkles className="h-3 w-3" /> AI-drafted
        </p>
        <p className="mt-1 text-sm text-on-surface">
          {aiCount} of {totalItems} medication{totalItems === 1 ? '' : 's'} drafted from
          the consultation. Review every field — clinician approval required before dispense.
        </p>
      </div>
      <button
        type="button"
        onClick={onRegenerate}
        className="shrink-0 rounded-lg border border-tertiary/40 bg-surface-container-lowest px-3 py-1.5 text-xs font-semibold text-tertiary transition-colors hover:bg-tertiary/5"
      >
        Re-generate
      </button>
    </div>
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

  // AI draft state.
  const [isAiDrafting, setIsAiDrafting] = useState(false);
  const [aiDraftError, setAiDraftError] = useState<string | null>(null);
  const [aiFilledIndexes, setAiFilledIndexes] = useState<Set<number>>(new Set());
  const [userEditedSinceAi, setUserEditedSinceAi] = useState(false);
  const hasAutoRunRef = useRef(false);

  // Reset on open / target change.
  useEffect(() => {
    if (!open) {
      hasAutoRunRef.current = false;
      return;
    }
    setItems(existing?.items?.length ? existing.items : seedFromMedications(medications));
    setNotes(existing?.notes ?? '');
    setPrescriptionId(existing?.id ?? null);
    setAiFilledIndexes(new Set());
    setUserEditedSinceAi(false);
    setAiDraftError(null);
  }, [open, existing, medications]);

  async function runAIDraft({ confirmOverwrite }: { confirmOverwrite: boolean }) {
    if (
      confirmOverwrite &&
      userEditedSinceAi &&
      !window.confirm(
        'Replace your edits with a fresh AI draft? Any changes you made will be lost.'
      )
    ) {
      return;
    }
    setIsAiDrafting(true);
    setAiDraftError(null);
    try {
      const aiItems = await generateAIPrescriptionDraft(consultationId);
      if (aiItems.length === 0) {
        setAiDraftError(
          "AI didn't detect any medications to prescribe in this consultation. Add medications manually below."
        );
        // Keep at least one empty row to preserve the form.
        setItems((prev) => (prev.length === 0 ? [emptyItem()] : prev));
        return;
      }
      setItems(aiItems);
      setAiFilledIndexes(new Set(aiItems.map((_, i) => i)));
      setUserEditedSinceAi(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to draft with AI';
      if (process.env.NODE_ENV !== 'production') {
        console.error('[prescription-draft-ai]', err);
      }
      setAiDraftError(message);
    } finally {
      setIsAiDrafting(false);
    }
  }

  // Auto-run on first open when there's no existing prescription.
  useEffect(() => {
    if (!open || hasAutoRunRef.current || existing?.items?.length) return;
    hasAutoRunRef.current = true;
    runAIDraft({ confirmOverwrite: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, existing, consultationId]);

  function updateItem<K extends keyof PrescriptionItem>(
    index: number,
    key: K,
    value: PrescriptionItem[K]
  ) {
    setItems((current) => current.map((item, i) => (i === index ? { ...item, [key]: value } : item)));
    // Touched item is no longer "purely AI-drafted" — drop the highlight so
    // the clinician sees what they've already reviewed/edited.
    if (aiFilledIndexes.has(index)) {
      setAiFilledIndexes((prev) => {
        const next = new Set(prev);
        next.delete(index);
        return next;
      });
    }
    setUserEditedSinceAi(true);
  }

  function addItem() {
    setItems((current) => [...current, emptyItem()]);
    setUserEditedSinceAi(true);
  }

  function removeItem(index: number) {
    setItems((current) => (current.length <= 1 ? current : current.filter((_, i) => i !== index)));
    // Re-index the AI-filled set after removal so highlights still point at
    // the right rows.
    setAiFilledIndexes((prev) => {
      const next = new Set<number>();
      prev.forEach((i) => {
        if (i < index) next.add(i);
        else if (i > index) next.add(i - 1);
      });
      return next;
    });
    setUserEditedSinceAi(true);
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
      // Supabase returns PostgrestError as a plain object (not an Error
      // instance), so `err.message` was being silently dropped before. Extract
      // the actual cause from either shape and log the full structure in dev.
      const sb = err as { message?: string; details?: string; hint?: string; code?: string };
      const message =
        err instanceof Error
          ? err.message
          : sb?.message ||
            (typeof err === 'string' ? err : 'Failed to save prescription');
      if (process.env.NODE_ENV !== 'production') {
        console.error('[prescription-save]', {
          message,
          details: sb?.details,
          hint: sb?.hint,
          code: sb?.code,
          raw: err,
        });
      }
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
      className="max-w-4xl"
      footer={
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
      }
    >
      <div className="space-y-6">
        {/* AI draft banner */}
        <AIDraftBanner
          isDrafting={isAiDrafting}
          error={aiDraftError}
          aiCount={aiFilledIndexes.size}
          totalItems={items.length}
          onRegenerate={() => runAIDraft({ confirmOverwrite: true })}
        />

        {/* Intro */}
        <div className="rounded-xl border border-secondary/15 bg-secondary/5 px-4 py-3 text-sm text-on-surface-variant">
          Review the medications extracted from the consultation, fill in missing
          dose details, then save a draft or approve and download the PDF. All
          prescriptions are clinician-reviewed before dispense.
        </div>

        {/* Medication cards */}
        <div className="space-y-4">
          <div className="flex items-baseline justify-between">
            <p className="label-text text-on-surface-variant">Medications</p>
            <p className="text-xs text-on-surface-variant">
              {items.length} item{items.length !== 1 ? 's' : ''}
            </p>
          </div>

          {items.map((item, index) => (
            <div
              key={`rx-item-${index}`}
              className={cn(
                'overflow-hidden rounded-2xl border bg-surface-container-lowest shadow-ambient-sm transition-shadow hover:shadow-ambient',
                aiFilledIndexes.has(index)
                  ? 'border-l-4 border-l-tertiary border-y-outline-variant/30 border-r-outline-variant/30'
                  : 'border-outline-variant/30'
              )}
            >
              {/* Card header */}
              <div className="flex items-center gap-3 border-b border-outline-variant/20 bg-secondary-fixed/30 px-5 py-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-on-secondary text-sm font-bold">
                  {index + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-on-surface">
                    {item.name || `Medication ${index + 1}`}
                  </p>
                  {(item.strength || item.form) && (
                    <p className="truncate text-xs text-on-surface-variant">
                      {[item.strength, item.form].filter(Boolean).join(' · ')}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  disabled={items.length <= 1}
                  aria-label={`Remove medication ${index + 1}`}
                  className="rounded-lg p-2 text-error transition-colors hover:bg-error/10 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* Body */}
              <div className="space-y-5 p-5">
                {/* Identification — Name (full width) */}
                <Input
                  label="Name"
                  value={item.name}
                  onChange={(e) => updateItem(index, 'name', e.target.value)}
                  placeholder="e.g. Amoxicillin"
                />

                {/* Form — strength + form */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Input
                    label="Strength"
                    value={item.strength ?? ''}
                    onChange={(e) => updateItem(index, 'strength', e.target.value || null)}
                    placeholder="500mg"
                  />
                  <Input
                    label="Form"
                    value={item.form ?? ''}
                    onChange={(e) => updateItem(index, 'form', e.target.value || null)}
                    placeholder="tablet"
                  />
                </div>

                {/* Dosage — how to take it */}
                <div>
                  <p className="label-text text-on-surface-variant mb-2">Dosage</p>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <Input
                      label="Dose"
                      value={item.dose}
                      onChange={(e) => updateItem(index, 'dose', e.target.value)}
                      placeholder="1 tablet"
                    />
                    <Input
                      label="Frequency"
                      value={item.frequency}
                      onChange={(e) => updateItem(index, 'frequency', e.target.value)}
                      placeholder="TDS"
                    />
                    <Input
                      label="Duration"
                      value={item.duration ?? ''}
                      onChange={(e) => updateItem(index, 'duration', e.target.value || null)}
                      placeholder="7 days"
                    />
                  </div>
                </div>

                {/* Dispense — administrative */}
                <div>
                  <p className="label-text text-on-surface-variant mb-2">Dispense</p>
                  <div className="grid max-w-md grid-cols-2 gap-3">
                    <Input
                      label="Quantity"
                      type="number"
                      value={item.quantity ?? ''}
                      onChange={(e) => updateItem(index, 'quantity', numericOrNull(e.target.value))}
                      placeholder="21"
                    />
                    <Input
                      label="Repeats"
                      type="number"
                      value={item.repeats ?? ''}
                      onChange={(e) => updateItem(index, 'repeats', numericOrNull(e.target.value))}
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* Patient instructions */}
                <Textarea
                  label="Instructions for patient"
                  value={item.instructions ?? ''}
                  onChange={(e) => updateItem(index, 'instructions', e.target.value || null)}
                  placeholder="e.g. Take with food, complete the full course"
                  rows={2}
                />
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addItem}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-outline-variant/60 bg-transparent px-4 py-3.5 text-sm font-semibold text-secondary transition-colors hover:border-secondary/50 hover:bg-secondary/5"
          >
            <Plus className="h-4 w-4" />
            Add another medication
          </button>
        </div>

        {/* Notes section */}
        <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-5 shadow-ambient-sm">
          <Textarea
            label="Notes to prescriber"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional notes to include on the printed prescription"
            rows={3}
          />
        </div>
      </div>
    </Dialog>
  );
}
