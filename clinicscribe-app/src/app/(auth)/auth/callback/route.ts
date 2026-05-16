import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Auth callback for Supabase email confirmation, magic link, and OAuth.
 *
 * Flow contract:
 *  1. Email-confirmation links from `signUp()` end here with a `code` and
 *     `type=signup`. We exchange the code (which sets the verified-email
 *     session cookies) and route the user to `/login?confirmed=1` so they
 *     do an explicit first sign-in. The login flow then routes them through
 *     `/onboarding` if their profile hasn't been onboarded yet.
 *  2. OAuth and magic-link callbacks pass `next=/somewhere` to control the
 *     post-auth destination. Default for those flows is `/dashboard`.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const type = searchParams.get('type');
  const explicitNext = searchParams.get('next');

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Email-verification callbacks: send the user back to login. They sign
      // in once with their fresh password, and the login redirect handler
      // then takes them through onboarding.
      if (type === 'signup' || type === 'email_change' || type === 'invite') {
        // The exchanged session is now in cookies — sign them straight back
        // out so the login flow is the canonical "first session" event.
        await supabase.auth.signOut();
        return NextResponse.redirect(`${origin}/login?confirmed=1`);
      }
      // OAuth / magic-link / recovery — preserve the requested destination.
      return NextResponse.redirect(`${origin}${explicitNext ?? '/dashboard'}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=Could not authenticate`);
}
