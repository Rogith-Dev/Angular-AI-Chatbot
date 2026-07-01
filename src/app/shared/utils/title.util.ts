const MAX_TITLE_LENGTH = 48;

/**
 * Derives a thread title from the first user message.
 * Truncates long messages and strips line breaks.
 */
export function generateTitleFromMessage(content: string): string {
  const normalized = content.replace(/\s+/g, ' ').trim();
  if (!normalized) {
    return 'New Chat';
  }

  if (normalized.length <= MAX_TITLE_LENGTH) {
    return normalized;
  }

  return `${normalized.slice(0, MAX_TITLE_LENGTH).trim()}…`;
}
