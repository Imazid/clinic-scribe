'use client';

import { useMemo, useState, type ReactNode } from 'react';
import {
  AlertCircle,
  Briefcase,
  HeartPulse,
  IdCard,
  NotebookPen,
  Phone,
  Plus,
  Stethoscope,
  User,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { patientSchema, type PatientInput } from '@/lib/validators';
import { PATIENT_SEX_OPTIONS } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface PatientFormProps {
  initialData?: Partial<PatientInput>;
  onSubmit: (data: PatientInput) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
}

/* ---------- Section card ---------- */

interface SectionCardProps {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  sub?: string;
  children: ReactNode;
}

function SectionCard({ icon: Icon, eyebrow, title, sub, children }: SectionCardProps) {
  return (
    <Card variant="default" className="p-0 overflow-hidden">
      <div className="flex items-center gap-3 border-b border-outline-variant/40 px-6 py-5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary-fixed text-secondary">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <div className="eyebrow mb-0.5">{eyebrow}</div>
          <p className="text-[15px] font-bold text-on-surface">{title}</p>
          {sub && <p className="mt-0.5 text-xs text-outline">{sub}</p>}
        </div>
      </div>
      <div className="px-6 py-5">{children}</div>
    </Card>
  );
}

/* ---------- Tag list (allergies / conditions) ---------- */

function TagListField({
  label,
  values,
  onAdd,
  onRemove,
  placeholder,
  inputValue,
  onInputChange,
  tone = 'secondary',
  helperEmpty,
}: {
  label: string;
  values: string[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  placeholder: string;
  inputValue: string;
  onInputChange: (next: string) => void;
  tone?: 'secondary' | 'error';
  helperEmpty?: string;
}) {
  const chipClasses =
    tone === 'error'
      ? 'bg-error/10 text-error border-error/20'
      : 'bg-secondary/10 text-secondary border-secondary/20';
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-on-surface">{label}</label>
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder={placeholder}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              onAdd();
            }
          }}
          className="flex-1"
        />
        <Button type="button" variant="outline" onClick={onAdd}>
          <Plus className="h-4 w-4" /> Add
        </Button>
      </div>
      {values.length === 0
        ? helperEmpty && (
            <p className="mt-2 text-xs text-on-surface-variant/80">{helperEmpty}</p>
          )
        : (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {values.map((value, i) => (
              <span
                key={`${value}-${i}`}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium',
                  chipClasses,
                )}
              >
                {value}
                <button
                  type="button"
                  onClick={() => onRemove(i)}
                  aria-label={`Remove ${value}`}
                  className="rounded-full p-0.5 transition-colors hover:bg-current/10"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
    </div>
  );
}

/* ---------- Form ---------- */

export function PatientForm({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = 'Save patient',
}: PatientFormProps) {
  const [form, setForm] = useState<PatientInput>({
    first_name: initialData?.first_name || '',
    last_name: initialData?.last_name || '',
    date_of_birth: initialData?.date_of_birth || '',
    sex: initialData?.sex || 'male',
    email: initialData?.email || null,
    phone: initialData?.phone || null,
    mrn: initialData?.mrn || null,
    medicare_number: initialData?.medicare_number || null,
    ihi: initialData?.ihi || null,
    allergies: initialData?.allergies || [],
    conditions: initialData?.conditions || [],
    consent_status: initialData?.consent_status || 'pending',
    notes: initialData?.notes || null,
    height_cm: initialData?.height_cm ?? null,
    provider_name: initialData?.provider_name ?? null,
    location: initialData?.location ?? null,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [allergyInput, setAllergyInput] = useState('');
  const [conditionInput, setConditionInput] = useState('');

  const age = useMemo(() => {
    if (!form.date_of_birth) return null;
    const d = new Date(form.date_of_birth);
    if (Number.isNaN(d.getTime())) return null;
    const now = new Date();
    let a = now.getFullYear() - d.getFullYear();
    const m = now.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < d.getDate())) a -= 1;
    return a >= 0 && a < 150 ? a : null;
  }, [form.date_of_birth]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const result = patientSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0] as string] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      await onSubmit(result.data);
    } catch {
      setErrors({ _form: 'Failed to save patient' });
    } finally {
      setLoading(false);
    }
  }

  function update<K extends keyof PatientInput>(field: K, value: PatientInput[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function addAllergy() {
    const trimmed = allergyInput.trim();
    if (!trimmed) return;
    if (form.allergies.includes(trimmed)) {
      setAllergyInput('');
      return;
    }
    update('allergies', [...form.allergies, trimmed]);
    setAllergyInput('');
  }

  function addCondition() {
    const trimmed = conditionInput.trim();
    if (!trimmed) return;
    if (form.conditions.includes(trimmed)) {
      setConditionInput('');
      return;
    }
    update('conditions', [...form.conditions, trimmed]);
    setConditionInput('');
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {errors._form && (
        <div className="flex items-start gap-2 rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{errors._form}</span>
        </div>
      )}

      <SectionCard
        icon={User}
        eyebrow="Personal"
        title="Personal information"
        sub="Name and demographics"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            id="first_name"
            label="First name *"
            value={form.first_name}
            onChange={(e) => update('first_name', e.target.value)}
            error={errors.first_name}
            placeholder="Adina"
          />
          <Input
            id="last_name"
            label="Last name *"
            value={form.last_name}
            onChange={(e) => update('last_name', e.target.value)}
            error={errors.last_name}
            placeholder="Ferreira"
          />
          <div>
            <Input
              id="dob"
              label="Date of birth *"
              type="date"
              value={form.date_of_birth}
              onChange={(e) => update('date_of_birth', e.target.value)}
              error={errors.date_of_birth}
            />
            {age !== null && (
              <p className="mt-1.5 text-xs text-on-surface-variant">
                {age} year{age === 1 ? '' : 's'} old
              </p>
            )}
          </div>
          <Select
            id="sex"
            label="Sex *"
            options={[...PATIENT_SEX_OPTIONS]}
            value={form.sex}
            onChange={(e) => update('sex', e.target.value as PatientInput['sex'])}
            error={errors.sex}
          />
        </div>
      </SectionCard>

      <SectionCard
        icon={Phone}
        eyebrow="Contact"
        title="Contact"
        sub="Optional — used for follow-up communication and patient summaries"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Input
              id="email"
              label="Email"
              type="email"
              value={form.email || ''}
              onChange={(e) => update('email', e.target.value || null)}
              placeholder="patient@example.com"
            />
            <p className="mt-1.5 text-xs text-outline">
              We never email a patient without your sign-off.
            </p>
          </div>
          <Input
            id="phone"
            label="Phone"
            value={form.phone || ''}
            onChange={(e) => update('phone', e.target.value || null)}
            placeholder="04XX XXX XXX"
          />
        </div>
      </SectionCard>

      <SectionCard
        icon={Briefcase}
        eyebrow="Clinic"
        title="Care context"
        sub="Where this patient is normally seen and by whom"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            id="provider_name"
            label="Preferred provider"
            value={form.provider_name || ''}
            onChange={(e) => update('provider_name', e.target.value || null)}
            placeholder="Dr. Jane Smith"
          />
          <Input
            id="location"
            label="Primary location"
            value={form.location || ''}
            onChange={(e) => update('location', e.target.value || null)}
            placeholder="Main Clinic"
          />
          <Input
            id="height_cm"
            label="Height (cm)"
            type="number"
            step="0.1"
            value={form.height_cm ?? ''}
            onChange={(e) =>
              update('height_cm', e.target.value === '' ? null : Number(e.target.value))
            }
            error={errors.height_cm}
            placeholder="172.5"
          />
        </div>
      </SectionCard>

      <SectionCard
        icon={IdCard}
        eyebrow="Identifiers"
        title="Identifiers"
        sub="Used for billing, Medicare, and cross-system patient matching"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Input
            id="mrn"
            label="MRN"
            value={form.mrn || ''}
            onChange={(e) => update('mrn', e.target.value || null)}
            placeholder="Internal ID"
          />
          <Input
            id="medicare"
            label="Medicare number"
            value={form.medicare_number || ''}
            onChange={(e) => update('medicare_number', e.target.value || null)}
            placeholder="2123 45678 9"
          />
          <Input
            id="ihi"
            label="IHI"
            value={form.ihi || ''}
            onChange={(e) => update('ihi', e.target.value || null)}
            placeholder="Individual Healthcare Identifier"
          />
        </div>
      </SectionCard>

      <SectionCard
        icon={HeartPulse}
        eyebrow="Medical"
        title="Allergies & conditions"
        sub="Both surface in every consultation brief and review screen"
      >
        <div className="space-y-5">
          <TagListField
            label="Allergies"
            values={form.allergies}
            onAdd={addAllergy}
            onRemove={(i) =>
              update(
                'allergies',
                form.allergies.filter((_, j) => j !== i),
              )
            }
            placeholder="e.g. Penicillin"
            inputValue={allergyInput}
            onInputChange={setAllergyInput}
            tone="error"
            helperEmpty="Press Enter or click Add for each allergy."
          />
          <TagListField
            label="Active conditions"
            values={form.conditions}
            onAdd={addCondition}
            onRemove={(i) =>
              update(
                'conditions',
                form.conditions.filter((_, j) => j !== i),
              )
            }
            placeholder="e.g. Hypertension"
            inputValue={conditionInput}
            onInputChange={setConditionInput}
            tone="secondary"
            helperEmpty="Press Enter or click Add for each condition."
          />
        </div>
      </SectionCard>

      <SectionCard
        icon={NotebookPen}
        eyebrow="Notes"
        title="Clinician notes"
        sub="Free-text context the AI can reference when drafting"
      >
        <Textarea
          id="notes"
          label="Notes"
          value={form.notes || ''}
          onChange={(e) => update('notes', e.target.value || null)}
          rows={4}
          placeholder="Anything that should follow this patient between visits…"
        />
      </SectionCard>

      <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
        )}
        <Button type="submit" isLoading={loading}>
          <Stethoscope className="h-4 w-4" />
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
