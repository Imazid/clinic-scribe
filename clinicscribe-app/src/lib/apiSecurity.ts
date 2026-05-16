import { NextResponse } from 'next/server';
import { Ratelimit, type Duration } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { createClient } from '@/lib/supabase/server';
import type { SupabaseClient } from '@supabase/supabase-js';

/* ─── Rate limiter ───────────────────────────────────────────────────────
 *
 * Distributed: Upstash Redis sliding window when both
 *   UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are set.
 * Falls back to per-instance in-memory buckets in dev / when those vars
 * are missing. Upstash gives us cross-region budget enforcement on
 * Vercel Fluid Compute (where the in-memory limiter caps at
 * `instance_count × limit`).
 *
 * Each (limit, windowMs) pair gets its own cached `Ratelimit` instance.
 * The limit is baked into the ratelimit object at construction, so we
 * memoise per shape. Keys passed at call time still segment the budget
 * per user / per IP.
 */
type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();
const limiterCache = new Map<string, Ratelimit>();

function getDistributedLimiter(limit: number, windowMs: number): Ratelimit | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  const cacheKey = `${limit}:${windowMs}`;
  const cached = limiterCache.get(cacheKey);
  if (cached) return cached;

  const limiter = new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(limit, msToDuration(windowMs)),
    analytics: false,
    prefix: 'miraa:rl',
  });
  limiterCache.set(cacheKey, limiter);
  return limiter;
}

function msToDuration(ms: number): Duration {
  if (ms % 3_600_000 === 0) return `${ms / 3_600_000} h` as Duration;
  if (ms % 60_000 === 0) return `${ms / 60_000} m` as Duration;
  if (ms % 1_000 === 0) return `${ms / 1_000} s` as Duration;
  return `${ms} ms` as Duration;
}

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

/**
 * Resolves the caller's `profiles.clinic_id`. The supplied client should be
 * the user-scoped one returned by `requireUser` so RLS still applies. Returns
 * a `forbidden()` response when the profile row is missing — a logged-in
 * user without a profile must not be allowed to mutate clinical data.
 */
export async function requireCallerClinic(
  supabase: SupabaseClient,
  userId: string
): Promise<
  | { clinicId: string; profileId: string; response: null }
  | { clinicId: null; profileId: null; response: NextResponse }
> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, clinic_id')
    .eq('user_id', userId)
    .maybeSingle();
  if (error || !data) {
    return { clinicId: null, profileId: null, response: forbidden() };
  }
  return { clinicId: data.clinic_id, profileId: data.id, response: null };
}

/**
 * Strict 404 — the caller is authenticated but is asking about an entity in
 * another clinic. Use this instead of `forbidden()` when the entity may not
 * exist; we don't want the response shape to oracle existence across clinics.
 */
export function notFound(message = 'Not found') {
  return NextResponse.json({ error: message }, { status: 404 });
}

/**
 * Returns `true` if the request is within budget, `false` if it exceeded.
 *
 * Uses Upstash Redis when configured (the production path on Vercel) and
 * falls back to a per-instance in-memory bucket otherwise. The function is
 * intentionally fail-open: if Upstash is unreachable mid-request we don't
 * lock users out — we degrade to the in-memory check.
 */
export async function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<boolean> {
  const distributed = getDistributedLimiter(limit, windowMs);
  if (distributed) {
    try {
      const { success } = await distributed.limit(key);
      return success;
    } catch {
      // Network blip — fall through to the in-memory limiter so a Redis
      // outage doesn't take Miraa offline.
    }
  }

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
  // Always log a redacted line: name + status only, never message/stack/body.
  // Raw errors frequently contain transcripts, prompts, or PHI snippets.
  const name = error instanceof Error ? error.name : 'UnknownError';
  const status = (error as { status?: number })?.status;
  console.error(`[${scope}] ${name}${status ? ` (${status})` : ''}`);

  // Verbose mode is OPT-IN via an explicit flag, NOT NODE_ENV. Vercel preview
  // builds run with NODE_ENV=production but we still want them quiet by
  // default — verbose logging is a developer-machine convenience only.
  if (process.env.MIRAA_VERBOSE_ERRORS === '1') {
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    console.error(`[${scope}] [verbose] message: ${message}`);
    if (stack) console.error(`[${scope}] [verbose] stack:\n${stack}`);
    // Anthropic / OpenAI SDK errors expose API response body via .error
    const sdkBody = (error as { error?: unknown }).error;
    if (sdkBody) {
      try {
        console.error(
          `[${scope}] [verbose] body: ${JSON.stringify(sdkBody, null, 2)}`
        );
      } catch {
        console.error(`[${scope}] [verbose] body (raw):`, sdkBody);
      }
    }
  }
}

interface AuditEntry {
  clinicId: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  details?: Record<string, unknown>;
  ipAddress?: string | null;
}

// Best-effort write to audit_logs. Never throws — non-repudiation logging
// must not block the underlying operation.
export async function writeAuditLog(
  supabase: SupabaseClient,
  entry: AuditEntry
): Promise<void> {
  try {
    const { error } = await supabase.from('audit_logs').insert({
      clinic_id: entry.clinicId,
      user_id: entry.userId,
      action: entry.action,
      entity_type: entry.entityType,
      entity_id: entry.entityId,
      details: entry.details ?? {},
      ip_address: entry.ipAddress ?? null,
    });
    if (error) logError(`audit-${entry.action}`, error);
  } catch (err) {
    logError(`audit-${entry.action}`, err);
  }
}

export function getRequestIp(request: Request): string | null {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    null
  );
}
