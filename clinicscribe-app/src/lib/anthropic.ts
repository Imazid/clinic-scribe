import Anthropic from '@anthropic-ai/sdk';

let client: Anthropic | null = null;

/**
 * Server-side Anthropic client. Lazy-init so that missing env vars only
 * throw at call time (not at module load), matching the OpenAI helper.
 */
export function getAnthropic(): Anthropic {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY is not set');
    }
    client = new Anthropic({ apiKey });
  }
  return client;
}

/**
 * Extracts the first text block from an Anthropic Messages API response.
 * Claude responses are arrays of content blocks; for non-tool calls we want
 * the plain text block.
 */
export function extractText(response: Anthropic.Messages.Message): string {
  for (const block of response.content) {
    if (block.type === 'text') {
      return block.text;
    }
  }
  return '';
}
