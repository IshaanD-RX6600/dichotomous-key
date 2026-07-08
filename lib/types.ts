/* Shared types for the whole app (DB rows + API payloads). */

export type KingdomKey = "plantae" | "animalia" | "fungi" | "micro";
export type RegionKey = "root" | "micro" | "fungi" | "split" | "plant" | "animal";

export interface Organism {
  id: string;
  common: string;
  binomial: string;
  kingdom: KingdomKey;
  grp: string; // taxonomic group ("group" is awkward as a column name)
  diagnostic: string; // "why the key lands here" (shown on the result card)
  traits: string[];
  image: string; // image URL ("" → placeholder box is shown)
  alt: string; // descriptive alt text
  caption: string; // APA image citation
  sort: number;
}

export interface KeyNode {
  id: string;
  num: string; // "1".."16", "8b"
  region: RegionKey;
  question: string;
  short: string;
  a_label: string;
  a_short: string;
  a_target: string; // another node id OR an organism id
  b_label: string;
  b_short: string;
  b_target: string;
  sort: number;
}

export interface Concept {
  id: number;
  heading: string;
  body: string;
  sort: number;
}

export interface RefEntry {
  id: number;
  entry: string;
  sort: number;
}

export interface SiteMetaData {
  siteTitle: string;
  subtitle: string;
  ecozone: string;
  introHeading: string;
  introBlurb: string;
  howToHeading: string;
  howTo: string[];
  referencesNote: string;
  footer: string;
}

export interface SiteData {
  organisms: Organism[];
  nodes: KeyNode[];
  concepts: Concept[];
  references: RefEntry[];
  meta: SiteMetaData;
}
