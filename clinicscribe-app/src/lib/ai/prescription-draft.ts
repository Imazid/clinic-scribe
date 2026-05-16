import { getAnthropic, extractText } from '@/lib/anthropic';
import { AI_CONFIG } from '@/lib/constants';
import type { PrescriptionItem } from '@/lib/types';

const SYSTEM_PROMPT = `You are a clinical prescription drafting assistant for an Australian general practice. Extract a prescription draft from the consultation context provided.

Output ONLY a JSON array of PrescriptionItem objects. No prose, no markdown fences, no explanation.

Each PrescriptionItem has shape:
{
  "name": string,
  "strength": string | null,
  "form": string | null,
  "dose": string,
  "frequency": string,
  "duration": string | null,
  "quantity": number | null,
  "repeats": number | null,
  "instructions": string | null
}

Rules:
1. Only include medications the clinician CLEARLY intends to prescribe IN THIS visit (the Plan section). Do NOT include the patient's existing medications unless the consultation explicitly indicates a new prescription is being written.
2. Use Australian conventions: TDS / BD / mane / nocte / PRN for frequency; PBS pack sizes for quantity where applicable.
3. If a field is not specified or cannot be inferred safely, use null. Never invent values.
4. quantity should match the duration when calculable (e.g., 7 days TDS = 21).
5. repeats default to 0 unless the consultation specifies otherwise.
6. instructions should be patient-facing (e.g., "Take with food, complete the course").
7. If no prescription is appropriate, return [].

Conservative bias: when in doubt, leave the field null. The clinician will review and approve every prescription before dispense.`;

export async function generatePrescriptionDraft(params: {
  transcript?: string;
  clinicalNote?: unknown;
  patientContext?: string;
}): Promise<PrescriptionItem[]> {
  const sections: string[] = [];

  if (params.patientContext) {
    sections.push(`PATIENT CONTEXT:\n${params.patientContext}`);
  }
  if (params.clinicalNote) {
    const noteStr =
      typeof params.clinicalNote === 'string'
        ? params.clinicalNote
        : JSON.stringify(params.clinicalNote, null, 2);
    sections.push(
      `CLINICAL NOTE (the Plan section is the primary signal for prescriptions):\n${noteStr}`
    );
  }
  if (params.transcript) {
    sections.push(`CONSULTATION TRANSCRIPT:\n${params.transcript}`);
  }

  if (sections.length === 0) {
    throw new Error('No source material (transcript or clinical note) available');
  }

  const userPrompt = `${sections.join('\n\n')}\n\nExtract the prescription draft as a JSON array of PrescriptionItem objects.`;

  const client = getAnthropic();
  const response = await client.messages.create({
    model: AI_CONFIG.noteModel,
    max_tokens: 2000,
    temperature: 0.1,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userPrompt }],
  });

  const text = extractText(response);
  if (!text) throw new Error('No response from AI');

  // Strip markdown fences if Claude wraps the JSON despite instructions.
  let jsonStr = text.trim();
  const fence = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) jsonStr = fence[1].trim();

  const parsed = JSON.parse(jsonStr) as unknown;
  if (!Array.isArray(parsed)) {
    throw new Error('AI returned non-array prescription draft');
  }

  return parsed
    .map(coercePrescriptionItem)
    .filter((i): i is PrescriptionItem => i !== null);
}

/**
 * Coerce arbitrary AI output into a strict PrescriptionItem.
 * Drops items missing a name; nulls all fields the AI didn't supply.
 */
function coercePrescriptionItem(raw: unknown): PrescriptionItem | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const name = typeof r.name === 'string' ? r.name.trim() : '';
  if (!name) return null;
  return {
    name,
    strength: nonEmptyString(r.strength),
    form: nonEmptyString(r.form),
    dose: typeof r.dose === 'string' ? r.dose.trim() : '',
    frequency: typeof r.frequency === 'string' ? r.frequency.trim() : '',
    duration: nonEmptyString(r.duration),
    quantity: finiteNumber(r.quantity),
    repeats: finiteNumber(r.repeats) ?? 0,
    instructions: nonEmptyString(r.instructions),
  };
}

function nonEmptyString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function finiteNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}
