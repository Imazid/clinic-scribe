import { NextResponse } from 'next/server';
import {
  logError,
  rateLimit,
  requireUser,
  tooMany,
} from '@/lib/apiSecurity';

/**
 * Resolves the Deepgram project id at request time. The previous version
 * cached the result in a module-level singleton, which on Vercel's Fluid
 * Compute would pin the FIRST tenant's project for the warm-instance
 * lifetime. If we ever scope Deepgram projects per-clinic that would leak
 * keys across tenants. Cheaper to fetch fresh than to break tenancy.
 */
async function resolveProjectId(apiKey: string): Promise<string | null> {
  const res = await fetch('https://api.deepgram.com/v1/projects', {
    headers: { Authorization: `Token ${apiKey}` },
  });
  if (!res.ok) return null;
  const projects = await res.json();
  return projects.projects?.[0]?.project_id ?? null;
}

export async function GET() {
  const { user, response } = await requireUser();
  if (response) return response;

  // 30 ephemeral keys per minute is well above legitimate (one per session
  // start) and well below what a stolen session cookie could exfiltrate.
  if (!(await rateLimit(`deepgram-token:${user.id}`, 30, 60_000))) return tooMany();

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
  } catch (err) {
    logError('deepgram-token', err);
    return NextResponse.json({ error: 'Transcription unavailable' }, { status: 503 });
  }
}
