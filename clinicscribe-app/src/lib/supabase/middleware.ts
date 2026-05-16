import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthRoute = request.nextUrl.pathname.startsWith('/login') ||
    request.nextUrl.pathname.startsWith('/signup') ||
    request.nextUrl.pathname.startsWith('/forgot-password') ||
    request.nextUrl.pathname.startsWith('/auth/callback');

  // `/onboarding` lives in the auth route group so freshly-signed-up users
  // (who don't yet have a confirmed-email session) can reach it. We never
  // redirect away from it based on auth state.
  const isOnboardingRoute = request.nextUrl.pathname.startsWith('/onboarding');

  // `/r/<slug>` is the public referral landing — must be reachable without
  // a session because the whole point is "click this and sign up".
  const isReferralRoute = request.nextUrl.pathname.startsWith('/r/');

  const isApiRoute = request.nextUrl.pathname.startsWith('/api/');
  const isWebhookRoute = request.nextUrl.pathname.startsWith('/api/stripe/webhook');

  // ─── Developer gate ─────────────────────────────────────────────────
  // The dev subdomain (e.g. `dev.miraahealth.com`) is locked to a
  // hand-picked email allowlist so the live deployment can be used as a
  // staging surface without exposing it to the public.
  //
  // Activation is purely env-driven so the same code path is safe on
  // production:
  //   - DEV_HOSTNAME=dev.miraahealth.com   (which host(s) trigger the gate;
  //                                          comma-separated for multiple)
  //   - DEV_EMAIL_ALLOWLIST=you@x.com,...  (who's allowed through)
  //
  // If the request host doesn't match DEV_HOSTNAME, the gate is skipped.
  // Webhook + auth/static paths always bypass so login can complete.
  const host = request.headers.get('host')?.toLowerCase() ?? '';
  const devHosts = (process.env.DEV_HOSTNAME ?? '')
    .toLowerCase()
    .split(',')
    .map((h) => h.trim())
    .filter(Boolean);
  const isOnDevHost = devHosts.length > 0 && devHosts.some((h) => host === h);
  const gateBypass =
    isWebhookRoute ||
    isAuthRoute ||
    isOnboardingRoute ||
    isReferralRoute ||
    request.nextUrl.pathname.startsWith('/_next/') ||
    request.nextUrl.pathname === '/favicon.ico' ||
    request.nextUrl.pathname === '/robots.txt' ||
    request.nextUrl.pathname.startsWith('/api/auth/'); // resend-confirmation etc.

  if (isOnDevHost && !gateBypass) {
    const allowlist = (process.env.DEV_EMAIL_ALLOWLIST ?? '')
      .toLowerCase()
      .split(',')
      .map((e) => e.trim())
      .filter(Boolean);
    const callerEmail = user?.email?.toLowerCase() ?? null;
    const allowed = callerEmail !== null && allowlist.includes(callerEmail);

    if (!allowed) {
      // Logged in but not on the allowlist → 404 (don't reveal the app's
      // surface exists). Not logged in → bounce to login so they can.
      if (callerEmail) {
        return new NextResponse('Not found', {
          status: 404,
          headers: { 'x-miraa-gate': 'denied' },
        });
      }
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('returnTo', request.nextUrl.pathname);
      url.searchParams.set('dev', '1');
      return NextResponse.redirect(url);
    }
  }
  // ─── end developer gate ─────────────────────────────────────────────

  // Stripe webhooks bypass auth — they use signature verification
  if (isWebhookRoute) {
    return supabaseResponse;
  }

  if (isOnboardingRoute || isReferralRoute) {
    return supabaseResponse;
  }

  if (!user && !isAuthRoute) {
    if (isApiRoute) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('returnTo', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
