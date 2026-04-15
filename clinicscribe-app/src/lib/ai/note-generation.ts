import { CLINICAL_NOTE_SYSTEM_PROMPT, buildNoteGenerationPrompt } from '@/lib/prompts';
import { AI_CONFIG } from '@/lib/constants';
import { getAnthropic, extractText } from '@/lib/anthropic';
import type { TemplateCatalogItem } from '@/lib/types';
import { getTemplateByKey } from '@/lib/templates/catalog';

export async function generateClinicalNoteArtifact(params: {
  transcript: string;
  patientContext?: string;
  consultationId?: string;
  templateKey?: string | null;
  template?: TemplateCatalogItem | null;
}) {
  const client = getAnthropic();
  const resolvedTemplate = params.template ?? getTemplateByKey(params.templateKey);
  const userPrompt = buildNoteGenerationPrompt(
    params.transcript,
    params.patientContext,
    resolvedTemplate
  );

  const response = await client.messages.create({
    model: AI_CONFIG.noteModel,
    max_tokens: AI_CONFIG.noteMaxTokens,
    temperature: 0.2,
    system: CLINICAL_NOTE_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userPrompt }],
  });

  const text = extractText(response);
  if (!text) {
    throw new Error('No response from AI');
  }

  // Claude occasionally wraps JSON in markdown fences despite instructions;
  // strip them before parsing. Same pattern the OpenAI path used.
  let jsonStr = text.trim();
  const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) jsonStr = jsonMatch[1].trim();

  const noteData = JSON.parse(jsonStr);

  return {
    ...noteData,
    ai_model: AI_CONFIG.noteModel,
    ai_prompt_version: AI_CONFIG.promptVersion,
    consultation_id: params.consultationId,
    template_key: resolvedTemplate.key,
  };
}
