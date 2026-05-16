import { NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import {
  getRequestIp,
  logError,
  rateLimit,
  tooMany,
} from '@/lib/apiSecurity';
import { hashInvitationToken } from '@/lib/invitations/token';

/**
 * Service-role client. Token lookup runs before signup so there is no user
 * session, and we read across clinics so RLS would block us. We use the
 * canonical service-role pattern (`@supabase/supabase-js`) rather than the
 * SSR cookie-shim — there are no cookies and no SSR semantics here.
 */
function createServiceClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

/**
 * Generic "not found" response used for every failure mode (invalid token,
 * expired, accepted, revoked, missing). Returning the same shape for every
 * failure means an attacker iterating tokens cannot tell whether the token
 * exists, has been used, has expired, or is malformed.
 */
function notFoundGeneric() {
  return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
}

export async function GET(request: Request) {
  // Rate-limit by IP. The endpoint is unauthenticated, so we can't key on
  // user id. 30 requests per minute is plenty for legitimate use (a single
  // signup page rendering) but stops scripted token-brute-forcing.
  const ip = getRequestIp(request) ?? 'unknown';
  if (!(await rateLimit(`invite-lookup:${ip}`, 30, 60_000))) return tooMany();

  const url = new URL(request.url);
  const token = url.searchParams.get('token');

  // Quick shape check — prevents trivially malformed values from reaching
  // the DB. base64url tokens from `randomBytes(24)` are 32 chars; we accept
  // a generous range to allow for future format changes.
  if (!token || token.length < 16 || token.length > 96) {
    return notFoundGeneric();
  }

  try {
    const supabase = createServiceClient();
    const tokenHash = hashInvitationToken(token);
    const { data, error } = await supabase
      .from('clinic_invitations')
      .select('email, role, expires_at, accepted_at, revoked_at, clinic:clinics(name)')
      .eq('token_hash', tokenHash)
      .maybeSingle();

    if (error || !data) return notFoundGeneric();

    if (data.accepted_at || data.revoked_at) return notFoundGeneric();
    if (new Date(data.expires_at).getTime() < Date.now()) {
      return notFoundGeneric();
    }

    const clinic = data.clinic as { name?: string } | { name?: string }[] | null;
    const clinicName = Array.isArray(clinic)
      ? clinic[0]?.name ?? null
      : clinic?.name ?? null;

    return NextResponse.json({
      email: data.email,
      role: data.role,
      clinicName,
      expiresAt: data.expires_at,
    });
  } catch (err) {
    logError('invitation-lookup', err);
    return notFoundGeneric();
  }
}
