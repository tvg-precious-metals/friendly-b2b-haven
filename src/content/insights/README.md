# Blog posts

One file = one post. Each file in this folder default-exports an `InsightPost` (the type is
in `../types.ts`). The site auto-collects every file here (via `src/content/insights.ts`)
and builds `/insights/{slug}` for any post that has a `body`; posts without a `body` show up
only as an unlinked teaser card on `/insights`, same as before this system existed.

**To publish a new post:** copy `_template.ts`, fill it in, save it under a new filename.
That's the whole operation — no other file needs editing. `_template.ts` itself is never
collected (it has no `default` export) and is safe to leave in place as a reference.

**Do not** add posts to a shared array or edit another post's file to add yours — the
one-file-per-post structure exists specifically so two posts being written at once (a
person and the content agent, or two content-agent runs) never touch the same file. See
`Agentic-Building-Guidelines.md` Section 3.2 in the vault for why that matters here.

After adding or editing a post, run `bun run sitemap` (or `bun run build`, which runs it
automatically first) to regenerate `public/sitemap.xml` so the new URL is included.

## Optional fields added for answer-engine (AEO) posts

- `updated`: ISO date of the last substantive change or source check. Shown in the byline,
  used as JSON-LD `dateModified` and as the sitemap `lastmod`. Set it only after a real re-check.
- `sources`: `[{ label, url }]`, the dated primary sources. Shown as a visible "Sources" list
  after the FAQ and emitted as `citation` in the Article JSON-LD.
- `disclaimer`: a short general-information notice shown after the sources.
- `author`: optional named byline, `{ name, title }`. Leave it out for house voice, as the
  published posts do. Use only a name and a title that have been approved for public use.
- Inline links: any text field may contain `[link text](/path)`. A link to an `/insights/{slug}`
  post that is not published renders as plain text, so posts can reference held siblings.
- Block types: `ol` is a numbered list of short items; a `callout` needs no `label`.

## Held posts (release gate)

A held post is a finished draft that must not be built into the site yet. It lives in `held/`
inside this folder. `held/` is git-ignored, so a held post is never committed, never part of a
deployed build and never in the site's JavaScript. Only the local dev server loads it, and only
with `VITE_SHOW_HELD=1`. Its `hold` string says what must be cleared before it is released.

- Preview locally: `VITE_SHOW_HELD=1 bun run dev` (PowerShell: `$env:VITE_SHOW_HELD = "1"; bun run dev`).
  Held posts then render with a "held draft" banner and a `noindex` tag. The variable has no
  effect in a production build.
- Release a post: clear the gate, move the file up one folder (`held/<slug>.ts` to `<slug>.ts`),
  set `date` (and `updated`) to the release date, delete the `hold` line, run `bun run sitemap`,
  and ship it through a reviewed pull request. The type import uses the `@/` alias, so it needs
  no change when the file moves.
- Links to a post that is not published show as plain text and become links on their own when
  that post is released.
- Safety net: a post in the main folder that still has a `hold` string is also left out of the
  collector, so a file moved too early stays unpublished.
