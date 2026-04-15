'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { patientSchema, type PatientInput } from '@/lib/validators';
import { PATIENT_SEX_OPTIONS } from '@/lib/constants';

interface PatientFormProps {
  initialData?: Partial<PatientInput>;
  onSubmit: (data: PatientInput) => Promise<void>;
  submitLabel?: string;
}

export function PatientForm({ initialData, onSubmit, submitLabel = 'Save Patient' }: PatientFormProps) {
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const result = patientSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => { fieldErrors[issue.path[0] as string] = issue.message; });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try { await onSubmit(result.data); }
    catch { setErrors({ _form: 'Failed to save patient' }); }
    finally { setLoading(false); }
  }

  function update(field: string, value: unknown) {
    setForm({ ...form, [field]: value });
  }

  function addAllergy() {
    if (!allergyInput.trim()) return;
    update('allergies', [...form.allergies, allergyInput.trim()]);
    setAllergyInput('');
  }

  function addCondition() {
    if (!conditionInput.trim()) return;
    update('conditions', [...form.conditions, conditionInput.trim()]);
    setConditionInput('');
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors._form && <div className="p-3 rounded-lg bg-error/10 text-error text-sm">{errors._form}</div>}

      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider">Personal Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input id="first_name" label="First Name" value={form.first_name} onChange={(e) => update('first_name', e.target.value)} error={errors.first_name} />
          <Input id="last_name" label="Last Name" value={form.last_name} onChange={(e) => update('last_name', e.target.value)} error={errors.last_name} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input id="dob" label="Date of Birth" type="date" value={form.date_of_birth} onChange={(e) => update('date_of_birth', e.target.value)} error={errors.date_of_birth} />
          <Select id="sex" label="Sex" options={[...PATIENT_SEX_OPTIONS]} value={form.sex} onChange={(e) => update('sex', e.target.value)} error={errors.sex} />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider">Contact</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input id="email" label="Email" type="email" value={form.email || ''} onChange={(e) => update('email', e.target.value || null)} />
          <Input id="phone" label="Phone" value={form.phone || ''} onChange={(e) => update('phone', e.target.value || null)} />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider">Care Context</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            id="provider_name"
            label="Preferred Provider"
            value={form.provider_name || ''}
            onChange={(e) => update('provider_name', e.target.value || null)}
            placeholder="Dr. Jane Smith"
          />
          <Input
            id="location"
            label="Primary Location"
            value={form.location || ''}
            onChange={(e) => update('location', e.target.value || null)}
            placeholder="Main Clinic"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            placeholder="e.g. 172.5"
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider">Identifiers</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input id="mrn" label="MRN" value={form.mrn || ''} onChange={(e) => update('mrn', e.target.value || null)} />
          <Input id="medicare" label="Medicare Number" value={form.medicare_number || ''} onChange={(e) => update('medicare_number', e.target.value || null)} />
          <Input id="ihi" label="IHI" value={form.ihi || ''} onChange={(e) => update('ihi', e.target.value || null)} />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider">Medical</h3>
        <div>
          <label className="block text-sm font-medium text-on-surface mb-1.5">Allergies</label>
          <div className="flex gap-2 mb-2">
            <input className="flex-1 px-3 py-2 rounded-lg bg-surface-container-low border border-outline-variant text-sm" value={allergyInput} onChange={(e) => setAllergyInput(e.target.value)} placeholder="Add allergy" onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addAllergy(); }}} />
            <Button type="button" variant="outline" size="sm" onClick={addAllergy}>Add</Button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {form.allergies.map((a, i) => (
              <span key={i} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-error/10 text-error text-xs font-medium">
                {a}
                <button type="button" onClick={() => update('allergies', form.allergies.filter((_, j) => j !== i))} className="hover:text-error/70">&times;</button>
              </span>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-on-surface mb-1.5">Conditions</label>
          <div className="flex gap-2 mb-2">
            <input className="flex-1 px-3 py-2 rounded-lg bg-surface-container-low border border-outline-variant text-sm" value={conditionInput} onChange={(e) => setConditionInput(e.target.value)} placeholder="Add condition" onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCondition(); }}} />
            <Button type="button" variant="outline" size="sm" onClick={addCondition}>Add</Button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {form.conditions.map((c, i) => (
              <span key={i} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-secondary/10 text-secondary text-xs font-medium">
                {c}
                <button type="button" onClick={() => update('conditions', form.conditions.filter((_, j) => j !== i))} className="hover:text-secondary/70">&times;</button>
              </span>
            ))}
          </div>
        </div>
        <Textarea id="notes" label="Notes" value={form.notes || ''} onChange={(e) => update('notes', e.target.value || null)} />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="submit" isLoading={loading}>{submitLabel}</Button>
      </div>
    </form>
  );
}
