/* Turn any stored string into clean plain text: drop inline HTML tags and
   decode the handful of entities used in the content. */
export function stripHtml(s: string | null | undefined): string {
  return (s ?? "")
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&rsquo;/g, "’")
    .replace(/&ldquo;/g, "“")
    .replace(/&rdquo;/g, "”")
    .replace(/&nbsp;/g, " ")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

import type { SiteData } from "./types";

/* Strip formatting from every content field (leaves ids/urls/enums intact). */
export function plainifySiteData(d: SiteData): SiteData {
  return {
    organisms: d.organisms.map((o) => ({
      ...o,
      common: stripHtml(o.common),
      binomial: stripHtml(o.binomial),
      grp: stripHtml(o.grp),
      diagnostic: stripHtml(o.diagnostic),
      traits: o.traits.map(stripHtml),
      alt: stripHtml(o.alt),
      caption: stripHtml(o.caption),
    })),
    nodes: d.nodes.map((n) => ({
      ...n,
      question: stripHtml(n.question),
      short: stripHtml(n.short),
      a_label: stripHtml(n.a_label),
      a_short: stripHtml(n.a_short),
      b_label: stripHtml(n.b_label),
      b_short: stripHtml(n.b_short),
    })),
    concepts: d.concepts.map((c) => ({
      ...c,
      heading: stripHtml(c.heading),
      body: stripHtml(c.body),
    })),
    references: d.references.map((r) => ({ ...r, entry: stripHtml(r.entry) })),
    meta: {
      ...d.meta,
      siteTitle: stripHtml(d.meta.siteTitle),
      subtitle: stripHtml(d.meta.subtitle),
      ecozone: stripHtml(d.meta.ecozone),
      introHeading: stripHtml(d.meta.introHeading),
      introBlurb: stripHtml(d.meta.introBlurb),
      howToHeading: stripHtml(d.meta.howToHeading),
      howTo: d.meta.howTo.map(stripHtml),
      referencesNote: stripHtml(d.meta.referencesNote),
      footer: stripHtml(d.meta.footer),
    },
  };
}
