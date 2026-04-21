import { NextResponse } from 'next/server';
import { checkOrigin, forbidden, logError, requireUser } from '@/lib/apiSecurity';

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  if (!checkOrigin(request)) return forbidden('Invalid origin');

  const { user, supabase, response } = await requireUser();
  if (response) return response;

  const { id } = await context.params;

  const { data: profile } = await supabase
    .from('profiles')
    .select('clinic_id, role')
    .eq('user_id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') return forbidden('Admins only');

  const { error } = await supabase
    .from('clinic_invitations')
    .update({ revoked_at: new Date().toISOString() })
    .eq('id', id)
    .eq('clinic_id', profile.clinic_id)
    .is('accepted_at', null);

  if (error) {
    logError('invitation-revoke', error);
    return NextResponse.json({ error: 'Failed to revoke invitation' }, { status: 500 });
  }

  return NextResponse.json({ revoked: true });
}
