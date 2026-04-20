import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

let cachedProjectId: string | null = null;

async function resolveProjectId(apiKey: string): Promise<string | null> {
  if (cachedProjectId) return cachedProjectId;
  const res = await fetch('https://api.deepgram.com/v1/projects', {
    headers: { Authorization: `Token ${apiKey}` },
  });
  if (!res.ok) return null;
  const projects = await res.json();
  cachedProjectId = projects.projects?.[0]?.project_id ?? null;
  return cachedProjectId;
}

export async function GET() {
  // Require an authenticated session — even short-lived tokens are PHI-adjacent
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const apiKey = process.env.DEEPGRAM_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Transcription unavailable' }, { status: 503 });
  }

  try {
    const projectId = await resolveProjectId(apiKey);
    if (!projectId) {
      return NextResponse.json({ error: 'Transcription unavailable' }, { status: 503 });
    }

    const tempKeyRes = await fetch(`https://api.deepgram.com/v1/projects/${projectId}/keys`, {
      method: 'POST',
      headers: {
        Authorization: `Token ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        comment: `clinicscribe-${user.id.slice(0, 8)}`,
        scopes: ['usage:write'],
        time_to_live_in_seconds: 30,
      }),
    });

    if (!tempKeyRes.ok) {
      return NextResponse.json({ error: 'Transcription unavailable' }, { status: 503 });
    }

    const tempKey = await tempKeyRes.json();
    if (!tempKey?.key) {
      return NextResponse.json({ error: 'Transcription unavailable' }, { status: 503 });
    }

    return NextResponse.json({ key: tempKey.key });
  } catch {
    return NextResponse.json({ error: 'Transcription unavailable' }, { status: 503 });
  }
}
