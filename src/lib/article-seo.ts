import type { InsightPost } from "@/content/types";
import { stripInlineLinks } from "./inline-links";
import { ORG_NAME, SITE_URL, pageMeta } from "./seo";

/**
 * Builds the full head() return value (meta, links, and JSON-LD scripts) for one article
 * page, entirely from its InsightPost data. This is what makes SEO/AEO correctness
 * automatic for every future post instead of something each new article can get wrong —
 * see the canonical/og:url bug that existed on every route except one before this pass.
 */
export function buildArticleHead(post: InsightPost) {
  const path = `/insights/${post.slug}`;
  const url = `${SITE_URL}${path}`;
  const base = pageMeta({
    title: post.title,
    description: post.description,
    path,
    ogType: "article",
    ogImage: post.ogImage,
  });

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    // Last substantive change or source check; falls back to the publication date.
    dateModified: post.updated ?? post.date,
    inLanguage: "en-GB",
    author: post.author
      ? { "@type": "Person", name: post.author.name, ...(post.author.title ? { jobTitle: post.author.title } : {}) }
      : { "@type": "Organization", name: ORG_NAME },
    publisher: { "@type": "Organization", name: ORG_NAME, url: SITE_URL },
    mainEntityOfPage: url,
    ...(post.ogImage ? { image: post.ogImage } : {}),
    // The dated primary sources shown in the visible "Sources" list, as schema.org `citation`.
    ...(post.sources?.length
      ? { citation: post.sources.map((s) => ({ "@type": "CreativeWork", name: s.label, url: s.url })) }
      : {}),
  };

  const scripts = [{ type: "application/ld+json", children: JSON.stringify(articleJsonLd) }];

  // FAQPage schema: included as basic hygiene when a post has real FAQ content, not because
  // it moves AI citations in 2026 — it doesn't (Google deprecated FAQ rich results May 2026;
  // Ahrefs' 2026 study found zero measurable citation uplift from schema markup generally,
  // since AI retrieval reads visible HTML, not JSON-LD). See the build log for sourcing.
  if (post.faq?.length) {
    scripts.push({
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: post.faq.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: stripInlineLinks(f.a) },
        })),
      }),
    });
  }

  // A held post only renders in a local preview (VITE_SHOW_HELD=1, see src/content/insights.ts).
  // If one ever reached a live deployment by mistake, keep it out of search indexes.
  const meta = post.hold ? [...base.meta, { name: "robots", content: "noindex, nofollow" }] : base.meta;

  return { ...base, meta, scripts };
}
