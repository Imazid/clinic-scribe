import { NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import {
  APP_URL,
  getRequestIp,
  logError,
  rateLimit,
  tooMany,
} from '@/lib/apiSecurity';

/**
 * `/r/<slug>` — referral landing.
 *
 * Anyone on the internet hits this. Flow:
 *   1. Rate-limit by IP (60 req/min) — generous for real humans, hostile
 *      to scripted slug enumeration.
 *   2. Resolve slug → inviter name via the `lookup_referral_slug` RPC.
 *      The RPC is SECURITY DEFINER + grant-execute to anon, so we can
 *      use the anon key (no service-role dependency).
 *   3. Set a `miraa_ref` cookie so the referral sticks through OAuth
 *      redirects that drop URL params.
 *   4. Redirect to `/signup?ref=<slug>&inviter=<name>`. If the slug
 *      didn't resolve, redirect to plain `/signup` so the inviter's typo
 *      doesn't leave the visitor stranded.
 */

const REFERRAL_COOKIE = 'miraa_ref';
const REFERRAL_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function anonClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const ip = getRequestIp(request) ?? 'unknown';
  if (!(await rateLimit(`ref-landing:${ip}`, 60, 60_000))) return tooMany();

  const { slug: raw } = await context.params;
  const slug = raw?.trim().toLowerCase();

  if (!slug || slug.length < 3 || slug.length > 64 || !/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.redirect(`${APP_URL}/signup`);
  }

  let inviter: string | null = null;
  let valid = false;
  try {
    const supabase = anonClient();
    const { data, error } = await supabase.rpc('lookup_referral_slug', { slug });
    if (!error && Array.isArray(data) && data[0]) {
      valid = true;
      const row = data[0] as { inviter_first_name?: string; inviter_last_name?: string };
      inviter = `${row.inviter_first_name ?? ''} ${row.inviter_last_name ?? ''}`.trim() || null;
    }
  } catch (err) {
    logError('referral-landing', err);
  }

  const target = new URL(`${APP_URL}/signup`);
  if (valid) {
    target.searchParams.set('ref', slug);
    if (inviter) target.searchParams.set('inviter', inviter);
  }

  const response = NextResponse.redirect(target);
  if (valid) {
    response.cookies.set(REFERRAL_COOKIE, slug, {
      httpOnly: false, // Read by client so /checkout can forward it.
      sameSite: 'lax',
      maxAge: REFERRAL_COOKIE_MAX_AGE,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
    });
  }
  return response;
}
