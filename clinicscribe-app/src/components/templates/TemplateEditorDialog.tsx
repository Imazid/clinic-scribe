'use client';

import { useEffect, useMemo, useState } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import type { TemplateCategory, TemplateOutputKind } from '@/lib/types';
import {
  formatTemplateCategoryLabel,
  formatTemplateOutputLabel,
  normalizeTemplateSections,
  type WorkspaceTemplate,
} from '@/lib/templates/runtime';

export interface TemplateEditorValues {
  name: string;
  category: TemplateCategory;
  outputKind: TemplateOutputKind;
  specialty: string;
  description: string;
  promptInstructions: string;
  sections: string[];
  tags: string[];
  isDefault: boolean;
}

interface TemplateEditorDialogProps {
  open: boolean;
  mode: 'create' | 'edit';
  template?: WorkspaceTemplate | null;
  onClose: () => void;
  onSave: (values: TemplateEditorValues) => Promise<void>;
}

const CATEGORY_VALUES: TemplateCategory[] = [
  'clinical_note',
  'clinic_letter',
  'referral_letter',
  'patient_communication',
  'meeting_note',
  'certificate',
  'form',
  'care_planning',
];

const CATEGORY_OPTIONS: Array<{ label: string; value: TemplateCategory }> = CATEGORY_VALUES.map(
  (category) => ({
    label: formatTemplateCategoryLabel(category),
    value: category,
  })
);

const OUTPUT_VALUES: TemplateOutputKind[] = [
  'note',
  'letter',
  'meeting',
  'certificate',
  'form',
  'patient_summary',
  'goals',
];

const OUTPUT_OPTIONS: Array<{ label: string; value: TemplateOutputKind }> = OUTPUT_VALUES.map(
  (outputKind) => ({
    label: formatTemplateOutputLabel(outputKind),
    value: outputKind,
  })
);

function getInitialState(template?: WorkspaceTemplate | null): TemplateEditorValues {
  return {
    name: template?.name ?? '',
    category: template?.category ?? 'clinical_note',
    outputKind: template?.output_kind ?? 'note',
    specialty: template?.specialty ?? '',
    description: template?.description ?? '',
    promptInstructions: template?.prompt_instructions ?? '',
    sections: template?.sections ?? ['Subjective', 'Objective', 'Assessment', 'Plan'],
    tags: template?.tags ?? [],
    isDefault: template?.is_default ?? false,
  };
}

export function TemplateEditorDialog({
  open,
  mode,
  template,
  onClose,
  onSave,
}: TemplateEditorDialogProps) {
  const [values, setValues] = useState<TemplateEditorValues>(getInitialState(template));
  const [sectionsText, setSectionsText] = useState(values.sections.join('\n'));
  const [tagsText, setTagsText] = useState(values.tags.join(', '));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const nextState = getInitialState(template);
    setValues(nextState);
    setSectionsText(nextState.sections.join('\n'));
    setTagsText(nextState.tags.join(', '));
    setError(null);
    setIsSaving(false);
  }, [template, open]);

  const title = useMemo(
    () => (mode === 'create' ? 'Create Template' : `Edit ${template?.name ?? 'Template'}`),
    [mode, template?.name]
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedSections = normalizeTemplateSections(sectionsText);
    const normalizedTags = Array.from(
      new Set(
        tagsText
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean)
      )
    );

    if (!values.name.trim()) {
      setError('Template name is required.');
      return;
    }
    if (normalizedSections.length === 0) {
      setError('Add at least one section.');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await onSave({
        ...values,
        name: values.name.trim(),
        specialty: values.specialty.trim(),
        description: values.description.trim(),
        promptInstructions: values.promptInstructions.trim(),
        sections: normalizedSections,
        tags: normalizedTags,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save template.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} title={title} className="max-w-3xl">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            id="template-name"
            label="Template name"
            value={values.name}
            onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))}
            placeholder="e.g. CKD Clinic Letter"
          />
          <Input
            id="template-specialty"
            label="Specialty"
            value={values.specialty}
            onChange={(event) =>
              setValues((current) => ({ ...current, specialty: event.target.value }))
            }
            placeholder="e.g. Renal"
          />
          <Select
            id="template-category"
            label="Category"
            value={values.category}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                category: event.target.value as TemplateCategory,
              }))
            }
            options={CATEGORY_OPTIONS}
          />
          <Select
            id="template-output-kind"
            label="Output"
            value={values.outputKind}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                outputKind: event.target.value as TemplateOutputKind,
              }))
            }
            options={OUTPUT_OPTIONS}
          />
        </div>

        <Textarea
          id="template-description"
          label="Description"
          value={values.description}
          onChange={(event) =>
            setValues((current) => ({ ...current, description: event.target.value }))
          }
          placeholder="Describe when this template should be used."
        />

        <Textarea
          id="template-instructions"
          label="Prompt instructions"
          value={values.promptInstructions}
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              promptInstructions: event.target.value,
            }))
          }
          placeholder="Give the AI the tone, emphasis, and structure you want."
        />

        <div className="grid gap-4 md:grid-cols-2">
          <Textarea
            id="template-sections"
            label="Sections"
            value={sectionsText}
            onChange={(event) => setSectionsText(event.target.value)}
            placeholder={'Subjective\nObjective\nAssessment\nPlan'}
          />
          <Textarea
            id="template-tags"
            label="Tags"
            value={tagsText}
            onChange={(event) => setTagsText(event.target.value)}
            placeholder="renal, clinic-letter, follow-up"
          />
        </div>

        <label className="flex items-center gap-3 rounded-2xl border border-outline-variant/40 bg-surface-container-low px-4 py-3 text-sm text-on-surface">
          <input
            type="checkbox"
            checked={values.isDefault}
            onChange={(event) =>
              setValues((current) => ({ ...current, isDefault: event.target.checked }))
            }
            className="h-4 w-4 rounded border-outline-variant text-secondary focus:ring-secondary"
          />
          Make this the default clinic template
        </label>

        {error ? <p className="text-sm text-error">{error}</p> : null}

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSaving}>
            {mode === 'create' ? 'Create template' : 'Save changes'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
