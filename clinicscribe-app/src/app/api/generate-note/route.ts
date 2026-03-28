import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { CLINICAL_NOTE_SYSTEM_PROMPT, buildNoteGenerationPrompt } from '@/lib/prompts';
import { AI_CONFIG } from '@/lib/constants';

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export async function POST(request: Request) {
  try {
    const openai = getOpenAI();
    const { transcript, patientContext, consultationId } = await request.json();

    if (!transcript) {
      return NextResponse.json({ error: 'No transcript provided' }, { status: 400 });
    }

    const userPrompt = buildNoteGenerationPrompt(transcript, patientContext);

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
      return NextResponse.json({ error: 'No response from AI' }, { status: 500 });
    }

    // Parse JSON (response_format guarantees valid JSON, but handle code blocks just in case)
    let jsonStr = text;
    const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) jsonStr = jsonMatch[1];

    const noteData = JSON.parse(jsonStr.trim());

    return NextResponse.json({
      ...noteData,
      ai_model: AI_CONFIG.noteModel,
      ai_prompt_version: AI_CONFIG.promptVersion,
      consultation_id: consultationId,
    });
  } catch (error) {
    console.error('Note generation error:', error);
    const message = error instanceof Error ? error.message : 'Note generation failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
