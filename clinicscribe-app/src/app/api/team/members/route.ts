import { NextResponse } from 'next/server';
import {
  logError,
  requireCallerClinic,
  requireUser,
} from '@/lib/apiSecurity';

/**
 * Lists clinicians + admins in the caller's clinic. Read-only — the team
 * page surfaces this list alongside `/api/invitations` so admins can see
 * who's onboarded vs. still pending an accept.
 *
 * Anyone in the clinic can list members (so non-admins can see who they
 * work with). Mutating ops (role changes, removal) belong on a different
 * route and require `role = 'admin'`.
 */
export async function GET() {
  const { user, supabase, response } = await requireUser();
  if (response) return response;

  const { clinicId, response: clinicError } = await requireCallerClinic(supabase, user.id);
  if (clinicError) return clinicError;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select(
        'id, user_id, first_name, last_name, specialty, role, avatar_url, created_at'
      )
      .eq('clinic_id', clinicId)
      .order('created_at', { ascending: true });

    if (error) {
      logError('team-members-list', error);
      return NextResponse.json({ error: 'Failed to load team' }, { status: 500 });
    }

    return NextResponse.json({ members: data ?? [] });
  } catch (error) {
    logError('team-members-list', error);
    return NextResponse.json({ error: 'Failed to load team' }, { status: 500 });
  }
}
