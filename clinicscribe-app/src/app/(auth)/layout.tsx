import type { ReactNode } from 'react';

/**
 * Auth route group layout — minimal pass-through. Each auth page owns its
 * full-bleed layout (Editorial Poster sign-in, Magazine sign-up, Rail
 * onboarding) so the chrome can vary per page rather than be forced into a
 * generic split.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen w-full">{children}</div>;
}
