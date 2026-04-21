import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { logError } from '@/lib/apiSecurity';

// Service-role client — token lookup runs before signup, so no auth.
// We expose only the minimum fields needed to render the invite page.
function createServiceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get('token');

  if (!token || token.length < 16) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
  }

  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from('clinic_invitations')
      .select('email, role, expires_at, accepted_at, revoked_at, clinic:clinics(name)')
      .eq('token', token)
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    if (data.accepted_at || data.revoked_at) {
      return NextResponse.json({ error: 'Invitation no longer valid' }, { status: 410 });
    }
    if (new Date(data.expires_at).getTime() < Date.now()) {
      return NextResponse.json({ error: 'Invitation expired' }, { status: 410 });
    }

    return NextResponse.json({
      email: data.email,
      role: data.role,
      clinicName:
        (data.clinic as { name?: string } | { name?: string }[] | null)?.constructor === Array
          ? ((data.clinic as { name?: string }[])[0]?.name ?? null)
          : (data.clinic as { name?: string } | null)?.name ?? null,
      expiresAt: data.expires_at,
    });
  } catch (err) {
    logError('invitation-lookup', err);
    return NextResponse.json({ error: 'Lookup failed' }, { status: 500 });
  }
}
