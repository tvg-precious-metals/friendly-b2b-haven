/**
 * Inline links inside post text.
 *
 * Post text fields (paragraphs, list and ol items, step bodies, callout text and FAQ answers)
 * may contain `[link text](/path)`. The renderer (src/components/site/Article.tsx) turns these
 * into anchors and the structured data (src/lib/article-seo.ts) strips them to plain text, so
 * both read the same definition of "a link" from here.
 */

/** Matches `[label](href)`; group 1 is the label, group 2 the href (no spaces, no ")"). */
export const INLINE_LINK_PATTERN = /\[([^\]]+)\]\(([^)\s]+)\)/g;

/** The text with every `[label](href)` reduced to `label`. JSON-LD must carry plain text. */
export function stripInlineLinks(text: string): string {
  return text.replace(INLINE_LINK_PATTERN, "$1");
}
