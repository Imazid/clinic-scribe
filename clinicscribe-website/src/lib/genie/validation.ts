/**
 * Validation helpers for Genie API route inputs.
 */

const MAX_COUNT = 100;
const FHIR_ID_PATTERN = /^[A-Za-z0-9\-.]{1,64}$/;
const MAX_CONTENT_LENGTH = 100_000; // 100 KB

/** Validate and clamp a _count query parameter. */
export function parseCount(value: string | null, defaultValue: number): number {
  if (!value) return defaultValue;
  const n = Number(value);
  if (!Number.isFinite(n) || n < 1) return defaultValue;
  return Math.min(n, MAX_COUNT);
}

/** Validate a FHIR resource ID (alphanumeric, hyphens, dots, max 64 chars). */
export function isValidFhirId(id: string): boolean {
  return FHIR_ID_PATTERN.test(id);
}

/** Validate clinical note content length. */
export function isContentWithinLimit(content: string): boolean {
  return content.length <= MAX_CONTENT_LENGTH;
}

/** Strip HTML tags from a string to prevent stored XSS. */
export function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, "");
}
