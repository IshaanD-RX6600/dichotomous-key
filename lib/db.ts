/* ===========================================================================
   Data layer.
   - If Postgres is configured (POSTGRES_URL present), the schema is created and
     seeded on first access, and all reads/writes hit the database.
   - If NOT configured, reads fall back to the seed data so the public site
     still works; writes throw a clear "not configured" error.
   =========================================================================== */
import { sql } from "@vercel/postgres";
import type {
  Concept,
  KeyNode,
  Organism,
  RefEntry,
  SiteData,
  SiteMetaData,
} from "./types";
import {
  seedOrganisms,
  seedNodes,
  seedConcepts,
  seedReferences,
  seedMeta,
} from "./keyData";
import { plainifySiteData } from "./text";

export const hasDb = !!(
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL_NON_POOLING
);

// Seed images act as a default: if a stored organism has no image, fall back to
// the bundled seed image for that id (so pre-seeded rows still show the photo).
const seedImageById = new Map(seedOrganisms.map((o) => [o.id, o.image]));
function withSeedImages(orgs: Organism[]): Organism[] {
  return orgs.map((o) => (o.image ? o : { ...o, image: seedImageById.get(o.id) ?? "" }));
}

class NoDbError extends Error {
  constructor() {
    super("Database is not configured. Set POSTGRES_URL to enable saving.");
    this.name = "NoDbError";
  }
}

/* ---- schema + one-time seed (cached per warm instance) ---- */
let readyPromise: Promise<void> | null = null;

async function ensureSchema(): Promise<void> {
  await sql`CREATE TABLE IF NOT EXISTS organisms (
    id text PRIMARY KEY, common text, binomial text, kingdom text, grp text,
    diagnostic text DEFAULT '', traits jsonb DEFAULT '[]'::jsonb,
    image text DEFAULT '', alt text DEFAULT '',
    caption text DEFAULT '', sort int DEFAULT 0
  )`;
  await sql`CREATE TABLE IF NOT EXISTS key_nodes (
    id text PRIMARY KEY, num text, region text, question text, short text,
    a_label text, a_short text, a_target text,
    b_label text, b_short text, b_target text, sort int DEFAULT 0
  )`;
  await sql`CREATE TABLE IF NOT EXISTS concepts (
    id serial PRIMARY KEY, heading text, body text, sort int DEFAULT 0
  )`;
  await sql`CREATE TABLE IF NOT EXISTS references_list (
    id serial PRIMARY KEY, entry text, sort int DEFAULT 0
  )`;
  await sql`CREATE TABLE IF NOT EXISTS site_meta (
    key text PRIMARY KEY, value text
  )`;
}

async function seedIfEmpty(): Promise<void> {
  const { rows } = await sql`SELECT COUNT(*)::int AS n FROM organisms`;
  if (rows[0].n > 0) return;
  await seedDatabase();
}

export async function seedDatabase(): Promise<void> {
  // wipe + insert (used for first-run seed and admin "reset to seed")
  await sql`TRUNCATE organisms, key_nodes, concepts, references_list, site_meta RESTART IDENTITY`;
  for (const o of seedOrganisms) await insertOrganism(o);
  for (const n of seedNodes) await upsertNode(n);
  for (const c of seedConcepts) await sql`INSERT INTO concepts (heading, body, sort) VALUES (${c.heading}, ${c.body}, ${c.sort})`;
  for (const r of seedReferences) await sql`INSERT INTO references_list (entry, sort) VALUES (${r.entry}, ${r.sort})`;
  await writeMeta(seedMeta);
}

async function ensureReady(): Promise<void> {
  if (!readyPromise) {
    readyPromise = (async () => {
      await ensureSchema();
      await seedIfEmpty();
    })().catch((e) => {
      readyPromise = null; // allow retry on next request
      throw e;
    });
  }
  return readyPromise;
}

/* ---- READS (public) ---- */
export async function getSiteData(): Promise<SiteData> {
  if (!hasDb) {
    return plainifySiteData({
      organisms: [...seedOrganisms],
      nodes: [...seedNodes],
      concepts: seedConcepts.map((c, i) => ({ id: i + 1, ...c })),
      references: seedReferences.map((r, i) => ({ id: i + 1, ...r })),
      meta: seedMeta,
    });
  }
  await ensureReady();
  const [organisms, nodes, concepts, references, meta] = await Promise.all([
    getOrganisms(),
    getNodes(),
    getConcepts(),
    getReferences(),
    getMeta(),
  ]);
  // Strip any inline formatting so both the public site and the admin editor
  // show clean plain text, regardless of what is stored.
  return plainifySiteData({ organisms: withSeedImages(organisms), nodes, concepts, references, meta });
}

export async function getOrganisms(): Promise<Organism[]> {
  const { rows } = await sql`SELECT * FROM organisms ORDER BY sort ASC, common ASC`;
  return rows.map(rowToOrganism);
}
export async function getNodes(): Promise<KeyNode[]> {
  const { rows } = await sql`SELECT * FROM key_nodes ORDER BY sort ASC`;
  return rows.map(rowToNode);
}
export async function getConcepts(): Promise<Concept[]> {
  const { rows } = await sql`SELECT * FROM concepts ORDER BY sort ASC, id ASC`;
  return rows.map((r) => ({ id: r.id, heading: r.heading, body: r.body, sort: r.sort }));
}
export async function getReferences(): Promise<RefEntry[]> {
  const { rows } = await sql`SELECT * FROM references_list ORDER BY sort ASC, id ASC`;
  return rows.map((r) => ({ id: r.id, entry: r.entry, sort: r.sort }));
}
export async function getMeta(): Promise<SiteMetaData> {
  const { rows } = await sql`SELECT key, value FROM site_meta`;
  const map = new Map(rows.map((r) => [r.key as string, r.value as string]));
  const g = (k: keyof SiteMetaData, fallback: string) => map.get(k as string) ?? fallback;
  let howTo = seedMeta.howTo;
  const rawHowTo = map.get("howTo");
  if (rawHowTo) {
    try {
      const parsed = JSON.parse(rawHowTo);
      if (Array.isArray(parsed)) howTo = parsed;
    } catch {
      /* keep default */
    }
  }
  return {
    siteTitle: g("siteTitle", seedMeta.siteTitle),
    subtitle: g("subtitle", seedMeta.subtitle),
    ecozone: g("ecozone", seedMeta.ecozone),
    introHeading: g("introHeading", seedMeta.introHeading),
    introBlurb: g("introBlurb", seedMeta.introBlurb),
    howToHeading: g("howToHeading", seedMeta.howToHeading),
    howTo,
    referencesNote: g("referencesNote", seedMeta.referencesNote),
    footer: g("footer", seedMeta.footer),
  };
}

function rowToOrganism(r: any): Organism {
  return {
    id: r.id, common: r.common, binomial: r.binomial, kingdom: r.kingdom,
    grp: r.grp, diagnostic: r.diagnostic ?? "", traits: Array.isArray(r.traits) ? r.traits : [],
    image: r.image ?? "", alt: r.alt ?? "", caption: r.caption ?? "", sort: r.sort ?? 0,
  };
}
function rowToNode(r: any): KeyNode {
  return {
    id: r.id, num: r.num, region: r.region, question: r.question, short: r.short,
    a_label: r.a_label, a_short: r.a_short, a_target: r.a_target,
    b_label: r.b_label, b_short: r.b_short, b_target: r.b_target, sort: r.sort ?? 0,
  };
}

/* ---- WRITES (admin only) ---- */
export function assertDb(): void {
  if (!hasDb) throw new NoDbError();
}

export async function insertOrganism(o: Organism): Promise<void> {
  await sql`INSERT INTO organisms (id, common, binomial, kingdom, grp, diagnostic, traits, image, alt, caption, sort)
    VALUES (${o.id}, ${o.common}, ${o.binomial}, ${o.kingdom}, ${o.grp}, ${o.diagnostic},
            ${JSON.stringify(o.traits)}::jsonb, ${o.image}, ${o.alt}, ${o.caption}, ${o.sort})
    ON CONFLICT (id) DO UPDATE SET
      common=EXCLUDED.common, binomial=EXCLUDED.binomial, kingdom=EXCLUDED.kingdom,
      grp=EXCLUDED.grp, diagnostic=EXCLUDED.diagnostic, traits=EXCLUDED.traits, image=EXCLUDED.image,
      alt=EXCLUDED.alt, caption=EXCLUDED.caption, sort=EXCLUDED.sort`;
}
export async function deleteOrganism(id: string): Promise<void> {
  await sql`DELETE FROM organisms WHERE id=${id}`;
}

export async function upsertNode(n: KeyNode): Promise<void> {
  await sql`INSERT INTO key_nodes (id, num, region, question, short, a_label, a_short, a_target, b_label, b_short, b_target, sort)
    VALUES (${n.id}, ${n.num}, ${n.region}, ${n.question}, ${n.short},
            ${n.a_label}, ${n.a_short}, ${n.a_target}, ${n.b_label}, ${n.b_short}, ${n.b_target}, ${n.sort})
    ON CONFLICT (id) DO UPDATE SET
      num=EXCLUDED.num, region=EXCLUDED.region, question=EXCLUDED.question, short=EXCLUDED.short,
      a_label=EXCLUDED.a_label, a_short=EXCLUDED.a_short, a_target=EXCLUDED.a_target,
      b_label=EXCLUDED.b_label, b_short=EXCLUDED.b_short, b_target=EXCLUDED.b_target, sort=EXCLUDED.sort`;
}
export async function deleteNode(id: string): Promise<void> {
  await sql`DELETE FROM key_nodes WHERE id=${id}`;
}

export async function createConcept(heading: string, body: string, sort: number): Promise<number> {
  const { rows } = await sql`INSERT INTO concepts (heading, body, sort) VALUES (${heading}, ${body}, ${sort}) RETURNING id`;
  return rows[0].id;
}
export async function updateConcept(id: number, heading: string, body: string): Promise<void> {
  await sql`UPDATE concepts SET heading=${heading}, body=${body} WHERE id=${id}`;
}
export async function deleteConcept(id: number): Promise<void> {
  await sql`DELETE FROM concepts WHERE id=${id}`;
}
export async function reorderConcepts(ids: number[]): Promise<void> {
  for (let i = 0; i < ids.length; i += 1) await sql`UPDATE concepts SET sort=${i} WHERE id=${ids[i]}`;
}

export async function createReference(entry: string, sort: number): Promise<number> {
  const { rows } = await sql`INSERT INTO references_list (entry, sort) VALUES (${entry}, ${sort}) RETURNING id`;
  return rows[0].id;
}
export async function updateReference(id: number, entry: string): Promise<void> {
  await sql`UPDATE references_list SET entry=${entry} WHERE id=${id}`;
}
export async function deleteReference(id: number): Promise<void> {
  await sql`DELETE FROM references_list WHERE id=${id}`;
}
export async function reorderReferences(ids: number[]): Promise<void> {
  for (let i = 0; i < ids.length; i += 1) await sql`UPDATE references_list SET sort=${i} WHERE id=${ids[i]}`;
}

export async function writeMeta(meta: Partial<SiteMetaData>): Promise<void> {
  const entries = Object.entries(meta);
  for (const [key, value] of entries) {
    const stored = key === "howTo" ? JSON.stringify(value) : String(value);
    await sql`INSERT INTO site_meta (key, value) VALUES (${key}, ${stored})
      ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value`;
  }
}

export async function nextSort(table: "concepts" | "references_list"): Promise<number> {
  const { rows } =
    table === "concepts"
      ? await sql`SELECT COALESCE(MAX(sort), -1) + 1 AS n FROM concepts`
      : await sql`SELECT COALESCE(MAX(sort), -1) + 1 AS n FROM references_list`;
  return rows[0].n;
}
