import type { NextConfig } from 'next';

/**
 * Security headers applied to every response.
 *
 * - `Strict-Transport-Security`: enforces HTTPS for 1 year, including
 *   subdomains. Set `preload` once we register with the HSTS preload list.
 * - `X-Frame-Options: DENY`: blocks framing entirely. Miraa has no embed
 *   surface and clinical content must not be rendered inside untrusted
 *   frames.
 * - `X-Content-Type-Options: nosniff`: stops MIME-sniffing-based attacks
 *   (especially for the PDF + audio download routes).
 * - `Referrer-Policy: strict-origin-when-cross-origin`: prevents referrer
 *   leakage of consultation IDs and tokens to third parties.
 * - `Permissions-Policy`: disables every powerful API except microphone,
 *   which the capture flow needs for `getUserMedia`. Geolocation, camera,
 *   payment, and USB are all denied — none of them are part of Miraa.
 * - `Content-Security-Policy`: a conservative baseline. `unsafe-inline` is
 *   required for Next.js's hydration bootstrap script and for inline styles
 *   produced by Tailwind/Framer Motion. Connections are restricted to
 *   self + Supabase + Anthropic + Stripe + Deepgram. Media (audio
 *   playback) is restricted to self and Supabase storage.
 */
function buildContentSecurityPolicy(): string {
  const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
    ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).host
    : '*.supabase.co';

  const directives: Record<string, string[]> = {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https://js.stripe.com'],
    'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
    'font-src': ["'self'", 'data:', 'https://fonts.gstatic.com'],
    'img-src': ["'self'", 'data:', 'blob:', `https://${supabaseHost}`],
    'media-src': ["'self'", 'blob:', `https://${supabaseHost}`],
    'connect-src': [
      "'self'",
      `https://${supabaseHost}`,
      `wss://${supabaseHost}`,
      'https://api.anthropic.com',
      'https://api.deepgram.com',
      'wss://api.deepgram.com',
      'https://api.stripe.com',
    ],
    'frame-src': ["'self'", 'https://js.stripe.com', 'https://hooks.stripe.com'],
    'frame-ancestors': ["'none'"],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
  };

  return Object.entries(directives)
    .map(([key, values]) => `${key} ${values.join(' ')}`)
    .join('; ');
}

const SECURITY_HEADERS = [
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains',
  },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value:
      'camera=(), geolocation=(), payment=(self "https://js.stripe.com"), usb=(), microphone=(self)',
  },
  { key: 'Content-Security-Policy', value: buildContentSecurityPolicy() },
];

const nextConfig: NextConfig = {
  // @react-pdf/renderer relies on Node built-ins and font binaries that
  // should not be bundled by Turbopack/webpack for the server runtime.
  serverExternalPackages: ['@react-pdf/renderer'],

  async headers() {
    return [
      {
        source: '/:path*',
        headers: SECURITY_HEADERS,
      },
    ];
  },
};

export default nextConfig;
