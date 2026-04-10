import OpenAI from 'openai';
import { CLINICAL_NOTE_SYSTEM_PROMPT, buildNoteGenerationPrompt } from '@/lib/prompts';
import { AI_CONFIG } from '@/lib/constants';
import type { TemplateCatalogItem } from '@/lib/types';
import { getTemplateByKey } from '@/lib/templates/catalog';

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export async function generateClinicalNoteArtifact(params: {
  transcript: string;
  patientContext?: string;
  consultationId?: string;
  templateKey?: string | null;
  template?: TemplateCatalogItem | null;
}) {
  const openai = getOpenAI();
  const resolvedTemplate = params.template ?? getTemplateByKey(params.templateKey);
  const userPrompt = buildNoteGenerationPrompt(
    params.transcript,
    params.patientContext,
    resolvedTemplate
  );

  const completion = await openai.chat.completions.create({
    model: AI_CONFIG.noteModel,
    max_tokens: 4096,
    temperature: 0.3,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: CLINICAL_NOTE_SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ],
  });

  const text = completion.choices[0]?.message?.content;
  if (!text) {
    throw new Error('No response from AI');
  }

  let jsonStr = text;
  const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) jsonStr = jsonMatch[1];

  const noteData = JSON.parse(jsonStr.trim());

  return {
    ...noteData,
    ai_model: AI_CONFIG.noteModel,
    ai_prompt_version: AI_CONFIG.promptVersion,
    consultation_id: params.consultationId,
    template_key: resolvedTemplate.key,
  };
}
