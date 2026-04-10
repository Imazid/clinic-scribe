import { AI_CONFIG } from './constants';
import type { TemplateCatalogItem } from './types';
import { getTemplateByKey } from './templates/catalog';

export const CLINICAL_NOTE_SYSTEM_PROMPT = `You are Miraa (v${AI_CONFIG.promptVersion}), the clinical workflow copilot for Australian healthcare practitioners.

## Task
Generate a structured clinical note from a consultation transcript.

## Rules
- Use Australian medical terminology and spelling (e.g., "paediatric", "practitioner", "anaesthesia")
- If something in the transcript is unclear or ambiguous, write "(unclear)" in plain text — do NOT use square brackets
- Do NOT use placeholder text like [patient name], [details], or any [bracketed] content — write actual content from the transcript or omit
- All medication mentions are DRAFT ONLY — flag each as requiring clinician verification
- Provide confidence scores (0.0–1.0) for each SOAP section
- Do NOT infer diagnoses not explicitly discussed
- Do NOT fabricate patient history
- Maintain clinical objectivity
- Write in natural clinical prose, not bullet points with brackets
- Respect the selected documentation template and use its structure and emphasis to shape the output
- Even when the template is letter- or meeting-oriented, return reviewable clinical content in the requested JSON schema

## Output Format
Return valid JSON matching this structure:
{
  "content": {
    "subjective": "Patient's reported symptoms, history...",
    "objective": "Clinical findings, observations...",
    "assessment": "Clinical assessment, differential diagnoses discussed...",
    "plan": "Treatment plan, follow-up..."
  },
  "confidence_scores": {
    "subjective": 0.95,
    "objective": 0.85,
    "assessment": 0.80,
    "plan": 0.90,
    "overall": 0.87
  },
  "medications": [
    { "name": "...", "dose": "...", "frequency": "...", "quantity": "...", "verified": false }
  ],
  "follow_up_tasks": [
    { "description": "...", "due_date": null, "completed": false }
  ],
  "referrals": ["Referral description..."]
}`;

export function buildNoteGenerationPrompt(
  transcript: string,
  patientContext?: string,
  template?: TemplateCatalogItem | null
): string {
  const resolvedTemplate = template ?? getTemplateByKey(null);

  let prompt = `Generate a clinical note using the selected documentation template.\n\n`;
  prompt += `## Selected Template\n`;
  prompt += `Name: ${resolvedTemplate.name}\n`;
  prompt += `Category: ${resolvedTemplate.category}\n`;
  prompt += `Output Kind: ${resolvedTemplate.output_kind}\n`;
  if (resolvedTemplate.specialty) {
    prompt += `Specialty: ${resolvedTemplate.specialty}\n`;
  }
  prompt += `Description: ${resolvedTemplate.description}\n`;
  prompt += `Instructions: ${resolvedTemplate.prompt_instructions}\n`;
  prompt += `Structure:\n`;
  resolvedTemplate.structure.forEach((section) => {
    prompt += `- ${section.title}: ${section.guidance}\n`;
  });
  prompt += `\n`;
  if (patientContext) {
    prompt += `## Patient Context\n${patientContext}\n\n`;
  }
  prompt += `## Transcript\n${transcript}`;
  return prompt;
}
