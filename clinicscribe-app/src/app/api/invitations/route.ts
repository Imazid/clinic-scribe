import { NextResponse } from 'next/server';
import {
  checkOrigin,
  forbidden,
  logError,
  rateLimit,
  requireUser,
  tooMany,
} from '@/lib/apiSecurity';
import {
  generateInvitationToken,
  hashInvitationToken,
} from '@/lib/invitations/token';

interface CreateInvitationBody {
  email?: string;
  role?: 'admin' | 'clinician' | 'receptionist';
}

const VALID_ROLES = new Set(['admin', 'clinician', 'receptionist']);

export async function GET() {
  const { user, supabase, response } = await requireUser();
  if (response) return response;

  const { data: profile } = await supabase
    .from('profiles')
    .select('clinic_id, role')
    .eq('user_id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') return forbidden('Admins only');

  const { data, error } = await supabase
    .from('clinic_invitations')
    .select('id, email, role, expires_at, accepted_at, revoked_at, created_at')
    .eq('clinic_id', profile.clinic_id)
    .order('created_at', { ascending: false });

  if (error) {
    logError('invitations-list', error);
    return NextResponse.json({ error: 'Failed to load invitations' }, { status: 500 });
  }

  return NextResponse.json({ invitations: data ?? [] });
}

export async function POST(request: Request) {
  if (!checkOrigin(request)) return forbidden('Invalid origin');

  const { user, supabase, response } = await requireUser();
  if (response) return response;

  if (!(await rateLimit(`invite-create:${user.id}`, 20, 60_000))) return tooMany();

  try {
    const body = (await request.json()) as CreateInvitationBody;

    const email = body.email?.trim().toLowerCase();
    const role = body.role ?? 'clinician';

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }
    if (!VALID_ROLES.has(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, clinic_id, role')
      .eq('user_id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') return forbidden('Admins only');

    // The plaintext token only ever exists in this request's memory and in
    // the email link delivered to the invitee. The DB stores only the
    // SHA-256 hash so a backup/log/replica leak doesn't surrender accept
    // tokens.
    const token = generateInvitationToken();
    const tokenHash = hashInvitationToken(token);

    const { data, error } = await supabase
      .from('clinic_invitations')
      .insert({
        clinic_id: profile.clinic_id,
        email,
        role,
        token,
        token_hash: tokenHash,
        invited_by: profile.id,
      })
      .select('id, email, role, expires_at, created_at')
      .single();

    if (error) {
      // Unique constraint = active invite already exists
      if ((error as { code?: string }).code === '23505') {
        return NextResponse.json(
          { error: 'An active invitation already exists for this email' },
          { status: 409 }
        );
      }
      logError('invitations-create', error);
      return NextResponse.json({ error: 'Failed to create invitation' }, { status: 500 });
    }

    return NextResponse.json({ invitation: data, token });
  } catch (error) {
    logError('invitations-create', error);
    return NextResponse.json({ error: 'Failed to create invitation' }, { status: 500 });
  }
}
