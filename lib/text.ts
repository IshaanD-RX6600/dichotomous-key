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

/* Strip formatting from every content field (leaves ids/urls/enums intact).

   EXCEPTION: the Home and Concepts sections keep their inline formatting so key
   terms can render bold. Those fields (concept bodies, the intro blurb, and the
   "how to use" steps) are left as stored HTML and rendered with <RichHtml>
   (which re-sanitizes). Every other field stays plain text, so the tree, key
   table, species gallery, and reference list are unchanged. */
export function plainifySiteData(d: SiteData): SiteData {
  return {
    organisms: d.organisms.map((o) => ({
      ...o,
      common: stripHtml(o.common),
      binomial: stripHtml(o.binomial),
      grp: stripHtml(o.grp),
      diagnostic: stripHtml(o.diagnostic),
      habitat: stripHtml(o.habitat),
      morphology: stripHtml(o.morphology),
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
      body: c.body, // rich: key terms rendered bold in the Concepts section
    })),
    references: d.references.map((r) => ({ ...r, entry: stripHtml(r.entry) })),
    meta: {
      ...d.meta,
      siteTitle: stripHtml(d.meta.siteTitle),
      subtitle: stripHtml(d.meta.subtitle),
      ecozone: stripHtml(d.meta.ecozone),
      introHeading: stripHtml(d.meta.introHeading),
      introBlurb: d.meta.introBlurb, // rich: rendered in the Home section
      howToHeading: stripHtml(d.meta.howToHeading),
      howTo: d.meta.howTo, // rich: rendered in the Home section
      referencesNote: stripHtml(d.meta.referencesNote),
      footer: stripHtml(d.meta.footer),
    },
  };
}
