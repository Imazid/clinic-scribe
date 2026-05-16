import { createHash, randomBytes } from 'node:crypto';

/**
 * Generates a fresh invitation URL token (192 bits of entropy, base64url).
 * The plaintext token is delivered to the invitee in the email link and is
 * never persisted; only the SHA-256 hash hits the database.
 */
export function generateInvitationToken(): string {
  return randomBytes(24).toString('base64url');
}

/**
 * Returns the lookup hash for a URL token. SHA-256 hex matches the format
 * produced by the database backfill in migration 014 so the column is
 * portable between Postgres-side and Node-side computation.
 */
export function hashInvitationToken(token: string): string {
  return createHash('sha256').update(token, 'utf8').digest('hex');
}
