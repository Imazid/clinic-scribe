import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { AI_CONFIG } from '@/lib/constants';
import {
  requireUser,
  rateLimit,
  checkOrigin,
  forbidden,
  tooMany,
  tooLarge,
  logError,
  MAX_AUDIO_BYTES,
  ALLOWED_AUDIO_MIME,
} from '@/lib/apiSecurity';

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export async function POST(request: Request) {
  if (!checkOrigin(request)) return forbidden('Invalid origin');

  const { user, response } = await requireUser();
  if (response) return response;

  if (!(await rateLimit(`transcribe:${user.id}`, 20, 60_000))) return tooMany();

  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File | null;

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    if (audioFile.size > MAX_AUDIO_BYTES) {
      return tooLarge('Audio exceeds 25MB limit');
    }

    if (audioFile.type && !ALLOWED_AUDIO_MIME.has(audioFile.type)) {
      return NextResponse.json(
        { error: 'Unsupported audio format' },
        { status: 415 }
      );
    }

    const openai = getOpenAI();
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

    return NextResponse.json({ text, segments });
  } catch (error) {
    logError('transcribe', error);
    return NextResponse.json({ error: 'Transcription failed' }, { status: 500 });
  }
}
