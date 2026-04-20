import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// In-memory sliding-window rate limiter. Per-instance only — for
// distributed enforcement add @upstash/ratelimit and swap the impl.
type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

const APP_ORIGIN = process.env.NEXT_PUBLIC_APP_URL ?? '';
const ALLOWED_ORIGINS = new Set(
  [
    APP_ORIGIN,
    process.env.NODE_ENV !== 'production' ? 'http://localhost:3000' : null,
    ...(process.env.ALLOWED_ORIGINS ?? '')
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean),
  ].filter(Boolean) as string[]
);

export const APP_URL = APP_ORIGIN || 'http://localhost:3000';

export function unauthorized(message = 'Unauthorized') {
  return NextResponse.json({ error: message }, { status: 401 });
}

export function forbidden(message = 'Forbidden') {
  return NextResponse.json({ error: message }, { status: 403 });
}

export function tooLarge(message = 'Payload too large') {
  return NextResponse.json({ error: message }, { status: 413 });
}

export function tooMany(message = 'Too many requests') {
  return NextResponse.json({ error: message }, { status: 429 });
}

export async function requireUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return { user: null, supabase, response: unauthorized() } as const;
  }
  return { user, supabase, response: null } as const;
}

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (bucket.count >= limit) return false;
  bucket.count += 1;
  return true;
}

export function checkOrigin(request: Request): boolean {
  // GET/HEAD do not need origin checks
  if (request.method === 'GET' || request.method === 'HEAD') return true;
  const origin = request.headers.get('origin');
  // Same-origin server-side fetches may have no Origin header — allow only
  // if Sec-Fetch-Site is 'same-origin' or absent (legacy browsers).
  if (!origin) {
    const site = request.headers.get('sec-fetch-site');
    return site === null || site === 'same-origin' || site === 'none';
  }
  return ALLOWED_ORIGINS.has(origin);
}

export function safeRedirectOrigin(): string {
  return APP_URL;
}

export const MAX_AUDIO_BYTES = 25 * 1024 * 1024; // 25MB (OpenAI limit)
export const ALLOWED_AUDIO_MIME = new Set([
  'audio/webm',
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/x-wav',
  'audio/mp4',
  'audio/m4a',
  'audio/x-m4a',
  'audio/ogg',
  'audio/flac',
]);

export function logError(scope: string, error: unknown) {
  // Strip detail; raw error often contains PHI/transcripts.
  const name = error instanceof Error ? error.name : 'UnknownError';
  const status = (error as { status?: number })?.status;
  console.error(`[${scope}] ${name}${status ? ` (${status})` : ''}`);
}
