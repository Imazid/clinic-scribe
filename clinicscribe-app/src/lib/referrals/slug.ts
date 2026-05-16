import { randomBytes } from 'node:crypto';

/**
 * Produces a stable, human-friendly slug for a referral permalink. Mirrors
 * the convention used in the design: lowercase first name + 4-char base36
 * suffix. The suffix prevents clashes across clinicians who share names and
 * keeps the slug short enough to fit comfortably in an SMS or email subject.
 *
 * Example outputs: "sarah-9k2x", "ihtisham-7q4m"
 */
export function generateReferralSlug(firstName: string | null | undefined): string {
  const base = (firstName ?? 'mira')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w]+/g, '')
    .slice(0, 16) || 'mira';
  const suffix = randomBytes(3).toString('base64url').slice(0, 4).toLowerCase();
  return `${base}-${suffix}`;
}
