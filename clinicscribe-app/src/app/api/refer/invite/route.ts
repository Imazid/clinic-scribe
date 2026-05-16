import { NextResponse } from 'next/server';
import {
  checkOrigin,
  forbidden,
  logError,
  rateLimit,
  requireCallerClinic,
  requireUser,
  tooMany,
} from '@/lib/apiSecurity';
import {
  generateInvitationToken,
  hashInvitationToken,
} from '@/lib/invitations/token';

interface InviteBody {
  emails?: string[];
  message?: string;
}

/**
 * Creates referral rows for each (unique, valid) email. Idempotent on
 * (referrer_user_id, lower(email)): a duplicate invite just refreshes the
 * token and bumps invited_at instead of double-inserting.
 *
 * Email delivery is the next step — for now the page surfaces the share URL
 * the user copies. When the mailer ships, it consumes `token` from the
 * returned rows to construct the link.
 */
export async function POST(request: Request) {
  if (!checkOrigin(request)) return forbidden('Invalid origin');

  const { user, supabase, response } = await requireUser();
  if (response) return response;
  if (!(await rateLimit(`refer-invite:${user.id}`, 10, 60_000))) return tooMany();

  const { clinicId, response: clinicError } = await requireCallerClinic(supabase, user.id);
  if (clinicError) return clinicError;

  let body: InviteBody;
  try {
    body = (await request.json()) as InviteBody;
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const message = typeof body.message === 'string' ? body.message.slice(0, 2000) : null;
  const emails = Array.isArray(body.emails) ? body.emails : [];
  const normalised = Array.from(
    new Set(
      emails
        .map((e) => (typeof e === 'string' ? e.trim().toLowerCase() : ''))
        .filter((e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e))
    )
  );

  if (normalised.length === 0) {
    return NextResponse.json({ error: 'No valid emails provided' }, { status: 400 });
  }
  if (normalised.length > 25) {
    return NextResponse.json({ error: 'Max 25 invites per request' }, { status: 400 });
  }

  try {
    // Refresh-or-insert per email. Keeping it as separate ops (not bulk
    // upsert) so we can return the per-row token to the caller.
    const created: Array<{ id: string; email: string; token: string }> = [];

    for (const email of normalised) {
      const token = generateInvitationToken();
      const tokenHash = hashInvitationToken(token);

      // Try update first (idempotent re-send).
      const { data: existing } = await supabase
        .from('referrals')
        .select('id')
        .eq('referrer_user_id', user.id)
        .eq('invitee_email', email)
        .maybeSingle();

      if (existing) {
        const { data: updated } = await supabase
          .from('referrals')
          .update({
            token,
            token_hash: tokenHash,
            status: 'invited',
            invited_at: new Date().toISOString(),
            message,
          })
          .eq('id', existing.id)
          .select('id')
          .maybeSingle();
        if (updated) created.push({ id: updated.id, email, token });
        continue;
      }

      const { data: inserted, error: insertError } = await supabase
        .from('referrals')
        .insert({
          referrer_user_id: user.id,
          referrer_clinic_id: clinicId,
          invitee_email: email,
          token,
          token_hash: tokenHash,
          status: 'invited',
          message,
        })
        .select('id')
        .single();

      if (insertError) {
        logError('refer-invite-insert', insertError);
        continue;
      }
      if (inserted) created.push({ id: inserted.id, email, token });
    }

    return NextResponse.json({ invitations: created });
  } catch (error) {
    logError('refer-invite', error);
    return NextResponse.json({ error: 'Failed to send invites' }, { status: 500 });
  }
}
