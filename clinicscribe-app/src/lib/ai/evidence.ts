import OpenAI from 'openai';
import type {
  EvidenceCitation,
  EvidenceQueryScope,
  Patient,
  QAFinding,
  SOAPNote,
} from '@/lib/types';
import { AI_CONFIG } from '@/lib/constants';

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

function buildEvidencePrompt(params: {
  question: string;
  scope: EvidenceQueryScope;
  sources: EvidenceCitation[];
  note?: SOAPNote;
  patient?: Patient | null;
  finding?: QAFinding | null;
}) {
  const { question, scope, sources, note, patient, finding } = params;

  const sourceBlock = sources
    .map(
      (source) =>
        `- ${source.id}\n  Title: ${source.title}\n  Organisation: ${source.organisation}\n  URL: ${source.url}\n  Topic: ${source.topic}\n  Summary: ${source.summary}`
    )
    .join('\n');

  return `You are generating a concise evidence note for clinicians using only the approved evidence sources provided below.

Rules:
- Use only the supplied sources.
- Do not invent citations, studies, or guideline details.
- Be conservative and explicitly state when local policy or specialist input is needed.
- Keep the answer short, practical, and suitable for GP workflow review.
- Return valid JSON only.

Output JSON:
{
  "answer": "Short evidence-informed answer",
  "key_points": ["point 1", "point 2"],
  "citation_ids": ["source-id-1", "source-id-2"]
}

Scope: ${scope}
Question: ${question}

${finding ? `Linked finding title: ${finding.title}\nLinked finding detail: ${finding.detail}\n` : ''}
${patient ? `Patient conditions: ${patient.conditions.join(', ') || 'None recorded'}\nPatient allergies: ${patient.allergies.join(', ') || 'None recorded'}\n` : ''}
${note ? `Current note assessment: ${note.assessment}\nCurrent note plan: ${note.plan}\n` : ''}

Approved sources:
${sourceBlock}`;
}

export async function generateEvidenceAnswer(params: {
  question: string;
  scope: EvidenceQueryScope;
  sources: EvidenceCitation[];
  note?: SOAPNote;
  patient?: Patient | null;
  finding?: QAFinding | null;
}) {
  const openai = getOpenAI();

  const completion = await openai.chat.completions.create({
    model: AI_CONFIG.noteModel,
    max_tokens: 900,
    temperature: 0.2,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content:
          'You are Miraa evidence assist. You provide short, citation-backed workflow guidance using only the supplied sources.',
      },
      {
        role: 'user',
        content: buildEvidencePrompt(params),
      },
    ],
  });

  const text = completion.choices[0]?.message?.content;
  if (!text) {
    throw new Error('No evidence response from AI');
  }

  const json = JSON.parse(text.trim()) as {
    answer?: string;
    key_points?: string[];
    citation_ids?: string[];
  };

  const citations =
    (json.citation_ids || [])
      .map((id) => params.sources.find((source) => source.id === id))
      .filter((source): source is EvidenceCitation => Boolean(source)) || [];

  return {
    answer:
      json.answer ||
      'Review the linked sources and reconcile the note against chart context before final sign-off.',
    key_points:
      Array.isArray(json.key_points) && json.key_points.length > 0
        ? json.key_points.slice(0, 4)
        : ['Use the cited source(s) to guide clinician review and document the resolved decision.'],
    citations: citations.length > 0 ? citations : params.sources.slice(0, 2),
  };
}
