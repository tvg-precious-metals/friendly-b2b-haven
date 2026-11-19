import type { InsightPost } from "./types";

/**
 * Auto-collects every post file in src/content/insights/ (eager, resolved at build time —
 * no runtime fetch, no CMS, works the same in dev and in the deployed SSR build). Adding a
 * new post is "add a new file to that folder that default-exports an InsightPost" — nothing
 * here needs editing. _template.ts intentionally has no default export, so it's collected
 * and then dropped by the `Boolean(default)` filter below rather than needing a fragile
 * negative glob pattern.
 */
const modules = import.meta.glob<{ default?: InsightPost }>("./insights/*.ts", { eager: true });

// Held drafts live in ./insights/held/, a git-ignored folder, so a deployed build never has those
// files. For local preview only, the dev server also loads that folder when VITE_SHOW_HELD=1.
// import.meta.env.DEV is replaced by a constant at build time (false in a production build), so a
// production build contains neither the folder's files nor this branch.
const SHOW_HELD = import.meta.env.DEV && import.meta.env.VITE_SHOW_HELD === "1";
const heldModules: Record<string, { default?: InsightPost }> = SHOW_HELD
  ? import.meta.glob<{ default?: InsightPost }>("./insights/held/*.ts", { eager: true })
  : {};

const entries = Object.entries({ ...modules, ...heldModules })
  .filter(([, mod]) => Boolean(mod.default))
  .map(([path, mod]) => [path, mod.default as InsightPost] as const);

// Fail loudly at build time on a duplicate slug rather than silently letting two files fight
// over one URL — matches this project's own "flag, don't silently ignore" standing rule.
const seenSlugs = new Map<string, string>();
for (const [path, post] of entries) {
  const existing = seenSlugs.get(post.slug);
  if (existing) {
    throw new Error(
      `Duplicate insight slug "${post.slug}": both ${existing} and ${path} use it. Slugs must be unique.`,
    );
  }
  seenSlugs.set(post.slug, path);
}

// Held posts (see InsightPost.hold in ./types) are drafts that exist in the repo but are not
// published: they are left out of everything below, so they get no page, no card on /insights,
// and links to them render as plain text. The duplicate-slug check above deliberately still
// covers them, so a held post cannot collide with a live slug unnoticed. A post in the main folder
// that still carries a `hold` string is left out as well (the safety net). Only the local
// preview (SHOW_HELD above) includes held posts, with a banner and a noindex tag on the page.
const allPosts: InsightPost[] = entries.map(([, post]) => post).filter((post) => SHOW_HELD || !post.hold);

/** All posts, newest first. */
export function getAllInsights(): InsightPost[] {
  return [...allPosts].sort((a, b) => (a.date < b.date ? 1 : -1));
}

/** Only posts that have a real body — the ones with an actual page to link to. */
export function getPublishedInsights(): InsightPost[] {
  return getAllInsights().filter((p) => Boolean(p.body?.length));
}

export function getInsightBySlug(slug: string): InsightPost | undefined {
  return allPosts.find((p) => p.slug === slug);
}
