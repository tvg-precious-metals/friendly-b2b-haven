/**
 * The blog-post content schema.
 *
 * This is "the template" — the shape every future tvg.gold article fills in. One post =
 * one file in src/content/insights/ (see _template.ts for a copy-paste starting point and
 * README.md in that folder for the workflow). Keeping one file per post, rather than one
 * shared array everyone edits, is deliberate: this codebase's own Agentic-Building-Guidelines
 * (Section 3.2, "small targeted diffs over whole-file rewrites") exists precisely because
 * concurrent edits to one shared file have caused real collisions elsewhere in this project.
 * A content agent shipping several posts a week should never need to touch a file another
 * post is also touching.
 */

/**
 * Text fields (p, list and ol items, steps, callout, FAQ answers) may carry inline links as
 * `[link text](/path)`. Only site-relative paths are meant to be used. A link to an
 * /insights/{slug} post that is not currently published renders as plain text, so a post can
 * link to a sibling that is still held without ever showing a dead link.
 */
export type ContentBlock =
  | { type: "p"; text: string }
  /** Section heading. Give it an id (kebab-case) to get an automatic table-of-contents entry. */
  | { type: "h2"; id?: string; text: string }
  | { type: "h3"; id?: string; text: string }
  | { type: "list"; items: string[] }
  /** Numbered list of short items (a sequence the reader follows in order). For process
   * steps that each need a title and a paragraph, use `steps` instead. */
  | { type: "ol"; items: string[] }
  /** Numbered process steps, rendered like the homepage's "How it works" / the guide's "seven-step process". */
  | { type: "steps"; items: { title: string; body: string }[] }
  /** A "What this means" / "Why it matters" pull-box — HubSpot's AEO guidance specifically
   * recommends these: a short, extractable, answer-first summary a reader (or an AI system
   * skimming the page) can lift without reading the surrounding prose. The label is optional:
   * leave it out and the box shows the text alone. */
  | { type: "callout"; label?: string; text: string }
  | { type: "quote"; text: string; attribution?: string };

export interface FaqItem {
  q: string;
  a: string;
}

/** One entry in a post's visible "Sources" list: publisher, title and date as the label, and
 * the page it was read at as the link. Also emitted as `citation` in the Article JSON-LD. */
export interface SourceRef {
  label: string;
  url: string;
}

/** Matches the five pillars in TessPreciousMetals/ContentCreation/TVG-Content-Agent-Build-Plan.md. */
export type InsightPillar =
  | "deal_story"
  | "hidden_value"
  | "market_commentary"
  | "insolvency"
  | "comparison_aeo";

export interface InsightAuthor {
  name: string;
  title?: string;
}

export interface InsightPost {
  /** URL segment. Page is served at /insights/{slug}. Lowercase, hyphenated, no dates. */
  slug: string;
  /** Short category label shown on the card and in the hero, e.g. "Compliance", "Market note". */
  kicker: string;
  /** Optional — which content-strategy pillar this piece serves. Not shown to readers. */
  pillar?: InsightPillar;
  /** The <h1> and (with " — Tess Van Ghert" appended) the <title>. */
  title: string;
  /**
   * ONE sentence-or-two description, 120–160 characters. Used as: the meta description, the
   * og:description, AND the card excerpt on /insights. One field instead of a separate
   * "excerpt" + "meta description" on purpose — two near-duplicate facts are exactly the kind
   * of thing that quietly drift apart; see the SEO/AEO build log's "entity consistency" note.
   */
  description: string;
  /** ISO date, e.g. "2026-06-12". Formatted for display and used as JSON-LD datePublished —
   * store it once, in one format, and format-for-display happens in code (formatDisplayDate). */
  date: string;
  /** Optional ISO date of the last substantive change or source check. Shown in the byline
   * ("Updated 12 June 2026"), used as JSON-LD dateModified and as the sitemap lastmod. Set it
   * only when the content or its sources were actually re-checked, never to stamp a build. */
  updated?: string;
  /** e.g. "6 min read". */
  readTime: string;
  /**
   * Optional named byline. Per current AEO/E-E-A-T guidance, a real named author with a real
   * title is a stronger trust signal than an unattributed company post — omit for a pure
   * house/Institutional piece, set it when a real person is the credited author.
   */
  author?: InsightAuthor;
  /** Optional longer sub-headline shown under the H1 in the hero (see the corporate-liquidation guide for the pattern). */
  heroDek?: string;
  /** Optional hero chip tags, e.g. ["Treasury", "Insolvency"]. */
  chips?: string[];
  /**
   * Full article body. Omit this field entirely (leave it undefined) for a teaser-only card —
   * the /insights listing renders those exactly as before (excerpt, not clickable) rather than
   * linking to a page with no real content behind it. This is how the four pre-existing
   * insights posts are represented: their real body copy was never written, so it isn't
   * invented here either.
   */
  body?: ContentBlock[];
  /** Optional. Rendered as real visible H3+paragraph FAQ content (also emits FAQPage JSON-LD —
   * see the build log for why that schema is hygiene now, not a citation lever). */
  faq?: FaqItem[];
  /** Optional. The dated primary sources behind the article, shown as a visible "Sources" list
   * after the FAQ and emitted as `citation` in the Article JSON-LD. */
  sources?: SourceRef[];
  /** Optional. A short general-information notice shown after the sources, e.g. on tax and
   * accounting posts ("general information as at {date}, not advice"). */
  disclaimer?: string;
  /**
   * Release gate. While this is set the post is NOT published: the collector in
   * src/content/insights.ts drops it, so it has no page, no card on /insights, no sitemap or
   * llms.txt entry, and links to it from other posts render as plain text. The string says
   * what has to be cleared first (reviewer, check or decision), for whoever releases it.
   * Held drafts live in src/content/insights/held/, a git-ignored folder that a deployed build
   * never contains. For a local preview run the dev server with VITE_SHOW_HELD=1: held posts then
   * render with a "held draft" banner and a noindex tag.
   * To release a post: clear the gate, move the file up one folder, set `date` (and `updated`) to
   * the release date, delete this field, run `bun run sitemap`, and ship it through a reviewed
   * pull request.
   */
  hold?: string;
  /** Optional per-post social-share image; falls back to the sitewide default. */
  ogImage?: string;
}
