import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  checkOrigin,
  forbidden,
  getRequestIp,
  logError,
  rateLimit,
  tooMany,
} from '@/lib/apiSecurity';

/**
 * Server-side wrapper around `supabase.auth.resend({ type: 'signup' })`.
 *
 * Rate-limit reasoning: the underlying SMTP provider has its own per-account
 * rate limits, but the client can spam the in-flight request and there is no
 * cooldown enforced in the browser. Worse, since `/onboarding` and `/signup`
 * are reachable without a session, a remote attacker who knows a victim's
 * email could mailbomb their inbox. We enforce TWO budgets:
 *   1. Per email — 3 sends per 5 minutes (matches Supabase's own UX advice)
 *   2. Per IP   — 20 sends per minute (catches scripted spraying)
 */
export async function POST(request: Request) {
  if (!checkOrigin(request)) return forbidden('Invalid origin');

  let body: { email?: string };
  try {
    body = (await request.json()) as { email?: string };
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
  }

  const ip = getRequestIp(request) ?? 'unknown';
  if (!(await rateLimit(`resend-ip:${ip}`, 20, 60_000))) return tooMany();
  if (!(await rateLimit(`resend-email:${email}`, 3, 5 * 60_000))) {
    // Generic 200 — even though we throttled, don't reveal whether this
    // email actually has a pending verification. Keeps the endpoint from
    // being an account-existence oracle.
    return NextResponse.json({ ok: true });
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.resend({ type: 'signup', email });
    // Always return 200 — surface a generic success so callers can't
    // enumerate registered emails by observing different responses.
    if (error) logError('resend-confirmation', error);
    return NextResponse.json({ ok: true });
  } catch (error) {
    logError('resend-confirmation', error);
    return NextResponse.json({ ok: true });
  }
}
