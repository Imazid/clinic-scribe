import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { AI_CONFIG } from '@/lib/constants';

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export async function POST(request: Request) {
  try {
    const openai = getOpenAI();
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File | null;

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    // gpt-4o-transcribe delivers higher accuracy than whisper-1 but only
    // supports `response_format: 'json'` (no verbose_json / timestamp_granularities).
    // We synthesise a single segment spanning the whole audio so downstream
    // viewers and persistence keep working unchanged.
    const response = await openai.audio.transcriptions.create({
      file: audioFile,
      model: AI_CONFIG.transcriptionModel,
      language: 'en',
      response_format: 'json',
    });

    const text = response.text ?? '';
    const segments = [
      {
        start: 0,
        end: 0,
        text,
        speaker: null,
      },
    ];

    return NextResponse.json({
      text,
      segments,
    });
  } catch (error) {
    console.error('Transcription error:', error);
    const message = error instanceof Error ? error.message : 'Transcription failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
