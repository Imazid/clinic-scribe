import { NextResponse } from 'next/server';
import {
  logError,
  requireCallerClinic,
  requireUser,
} from '@/lib/apiSecurity';
import { generateReferralSlug } from '@/lib/referrals/slug';

/**
 * Returns everything the /refer page needs to render:
 *   - slug         → the clinician's permalink handle
 *   - earnings     → months_earned + months_pending
 *   - stats        → { invited, joined, pending }
 *   - invitees     → 50 most recent referrals
 *
 * Side effect: lazily creates a referral_slug on the calling profile if
 * none exists yet, so the share URL is always real.
 */
export async function GET() {
  const { user, supabase, response } = await requireUser();
  if (response) return response;

  const { clinicId, response: clinicError } = await requireCallerClinic(supabase, user.id);
  if (clinicError) return clinicError;

  try {
    // ─── Profile (slug + first name) ─────────────────────────────────
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, first_name, referral_slug')
      .eq('user_id', user.id)
      .maybeSingle();

    if (profileError || !profile) {
      logError('refer-state-profile', profileError);
      return NextResponse.json({ error: 'Profile not found' }, { status: 500 });
    }

    let slug = profile.referral_slug as string | null;
    if (!slug) {
      // Race-safe: try up to 5 times in case of unique-index collisions.
      for (let attempt = 0; attempt < 5; attempt++) {
        const candidate = generateReferralSlug(profile.first_name as string | null);
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ referral_slug: candidate })
          .eq('id', profile.id);
        if (!updateError) {
          slug = candidate;
          break;
        }
        if ((updateError as { code?: string }).code !== '23505') {
          logError('refer-state-slug', updateError);
          break;
        }
      }
    }

    // ─── Referrals ────────────────────────────────────────────────────
    const { data: referrals, error: referralsError } = await supabase
      .from('referrals')
      .select('id, invitee_email, status, invited_at, signed_up_at, activated_at, expires_at')
      .eq('referrer_user_id', user.id)
      .order('invited_at', { ascending: false })
      .limit(50);

    if (referralsError) {
      // Schema-missing fallback (env hasn't run migration 020 yet).
      const code = (referralsError as { code?: string }).code;
      if (code === 'PGRST205' || code === '42P01') {
        return NextResponse.json({
          slug,
          stats: { invited: 0, joined: 0, pending: 0 },
          earnings: { months_earned: 0, months_pending: 0 },
          invitees: [],
        });
      }
      logError('refer-state-list', referralsError);
      return NextResponse.json({ error: 'Failed to load referrals' }, { status: 500 });
    }

    const list = referrals ?? [];
    const stats = {
      invited: list.length,
      joined: list.filter((r) => r.status === 'activated').length,
      pending: list.filter((r) => r.status === 'invited' || r.status === 'signed_up').length,
    };
    const earnings = {
      months_earned: stats.joined * 3,
      months_pending: list.filter((r) => r.status === 'signed_up').length * 3,
    };

    return NextResponse.json({
      slug,
      stats,
      earnings,
      invitees: list,
      clinic_id: clinicId,
    });
  } catch (error) {
    logError('refer-state', error);
    return NextResponse.json({ error: 'Failed to load referral state' }, { status: 500 });
  }
}
