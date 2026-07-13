import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  assertDb,
  createConcept,
  createReference,
  deleteConcept,
  deleteNode,
  deleteOrganism,
  deleteReference,
  getNodes,
  getOrganisms,
  insertOrganism,
  nextSort,
  reorderConcepts,
  reorderReferences,
  seedDatabase,
  updateConcept,
  updateReference,
  upsertNode,
  writeMeta,
} from "@/lib/db";
import { sanitizeHtml, sanitizePlain } from "@/lib/sanitize";
import { validateGraph } from "@/lib/display";
import type { KeyNode, KingdomKey, Organism, RegionKey, SiteMetaData } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const KINGDOMS: KingdomKey[] = ["plantae", "animalia", "fungi", "micro"];
const REGIONS: RegionKey[] = ["root", "micro", "fungi", "split", "plant", "animal"];

function bad(msg: string, code = 400) {
  return NextResponse.json({ error: msg }, { status: code });
}
function ok(extra: Record<string, unknown> = {}) {
  revalidatePath("/");
  revalidatePath("/admin");
  return NextResponse.json({ ok: true, savedAt: new Date().toISOString(), ...extra });
}
function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 40);
}

async function nodeWarnings() {
  const [nodes, organisms] = await Promise.all([getNodes(), getOrganisms()]);
  return validateGraph(nodes, organisms).map((i) => `${i.nodeId}: ${i.detail}`);
}

export async function POST(
  req: NextRequest,
  { params }: { params: { entity: string } }
) {
  try {
    assertDb();
  } catch (e: any) {
    return bad(e.message ?? "Database not configured", 503);
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return bad("Invalid JSON body.");
  }
  const op = body?.op as string;
  const entity = params.entity;

  try {
    switch (entity) {
      /* ------------------------------------------------ organisms */
      case "organisms": {
        if (op === "delete") {
          if (!body.id) return bad("Missing id.");
          await deleteOrganism(String(body.id));
          return ok();
        }
        const d = body.data ?? {};
        const binomial = sanitizePlain(d.binomial);
        if (!/^\S+\s+\S+/.test(binomial)) {
          return bad("Binomial name must be two words (Genus species).");
        }
        const kingdom: KingdomKey = KINGDOMS.includes(d.kingdom) ? d.kingdom : "micro";
        const traits = Array.isArray(d.traits)
          ? d.traits.map((t: unknown) => sanitizePlain(t)).filter((t: string) => t.length)
          : [];
        const image = sanitizePlain(d.image);
        if (image && !/^https?:\/\//i.test(image)) {
          return bad("Image URL must start with http:// or https:// (or be blank).");
        }
        const id = op === "create" ? slug(binomial) || `org-${Date.now().toString(36)}` : String(d.id);
        if (!id) return bad("Missing id.");
        const organism: Organism = {
          id,
          common: sanitizePlain(d.common) || "Unnamed organism",
          binomial,
          kingdom,
          grp: sanitizePlain(d.grp),
          diagnostic: sanitizePlain(d.diagnostic),
          habitat: sanitizePlain(d.habitat),
          morphology: sanitizePlain(d.morphology),
          traits,
          image,
          alt: sanitizePlain(d.alt) || `Photograph of ${sanitizePlain(d.common)} (${binomial})`,
          caption: sanitizePlain(d.caption),
          sort: Number.isFinite(d.sort) ? Number(d.sort) : 999,
        };
        await insertOrganism(organism);
        return ok({ id });
      }

      /* ------------------------------------------------ key nodes */
      case "nodes": {
        if (op === "delete") {
          if (!body.id) return bad("Missing id.");
          await deleteNode(String(body.id));
          return ok({ warnings: await nodeWarnings() });
        }
        const d = body.data ?? {};
        const region: RegionKey = REGIONS.includes(d.region) ? d.region : "root";
        const id = op === "create" ? slug(sanitizePlain(d.id) || sanitizePlain(d.num) || "") || `n-${Date.now().toString(36)}` : String(d.id);
        if (!id) return bad("Missing id.");
        const node: KeyNode = {
          id,
          num: sanitizePlain(d.num) || id,
          region,
          question: sanitizePlain(d.question),
          short: sanitizePlain(d.short),
          a_label: sanitizePlain(d.a_label),
          a_short: sanitizePlain(d.a_short),
          a_target: sanitizePlain(d.a_target),
          b_label: sanitizePlain(d.b_label),
          b_short: sanitizePlain(d.b_short),
          b_target: sanitizePlain(d.b_target),
          sort: Number.isFinite(d.sort) ? Number(d.sort) : 999,
        };
        await upsertNode(node);
        return ok({ warnings: await nodeWarnings() });
      }

      /* ------------------------------------------------ concepts */
      case "concepts": {
        // Bodies keep inline formatting so key terms stay bold in the Concepts
        // section; headings are plain text.
        if (op === "create") {
          const sort = await nextSort("concepts");
          const id = await createConcept(sanitizePlain(body.data?.heading) || "New concept", sanitizeHtml(body.data?.body), sort);
          return ok({ id });
        }
        if (op === "update") {
          if (!body.data?.id) return bad("Missing id.");
          await updateConcept(Number(body.data.id), sanitizePlain(body.data.heading), sanitizeHtml(body.data.body));
          return ok();
        }
        if (op === "delete") {
          await deleteConcept(Number(body.id));
          return ok();
        }
        if (op === "reorder") {
          await reorderConcepts((body.ids ?? []).map(Number));
          return ok();
        }
        return bad("Unknown op.");
      }

      /* ------------------------------------------------ references */
      case "references": {
        if (op === "create") {
          const sort = await nextSort("references_list");
          const id = await createReference(sanitizePlain(body.data?.entry) || "New reference", sort);
          return ok({ id });
        }
        if (op === "update") {
          if (!body.data?.id) return bad("Missing id.");
          await updateReference(Number(body.data.id), sanitizePlain(body.data.entry));
          return ok();
        }
        if (op === "delete") {
          await deleteReference(Number(body.id));
          return ok();
        }
        if (op === "reorder") {
          await reorderReferences((body.ids ?? []).map(Number));
          return ok();
        }
        return bad("Unknown op.");
      }

      /* ------------------------------------------------ site meta */
      case "meta": {
        const d = body.data ?? {};
        const patch: Partial<SiteMetaData> = {};
        // The intro blurb keeps inline formatting so key terms render bold in the
        // Home section; every other meta field is plain text.
        const htmlKeys = new Set(["introBlurb"]);
        const allowed: (keyof SiteMetaData)[] = [
          "siteTitle", "subtitle", "ecozone", "introHeading", "introBlurb",
          "howToHeading", "referencesNote", "footer",
        ];
        for (const k of allowed) {
          if (typeof d[k] === "string") {
            (patch as any)[k] = htmlKeys.has(k) ? sanitizeHtml(d[k]) : sanitizePlain(d[k]);
          }
        }
        if (Array.isArray(d.howTo)) {
          // "How to use" steps also render in the Home section with bold terms.
          patch.howTo = d.howTo.map((s: unknown) => sanitizeHtml(s));
        }
        await writeMeta(patch);
        return ok();
      }

      /* ------------------------------------------------ database */
      case "db": {
        if (op === "seed") {
          await seedDatabase();
          return ok();
        }
        return bad("Unknown op.");
      }

      default:
        return bad("Unknown entity.", 404);
    }
  } catch (e: any) {
    return bad(e?.message ?? "Server error.", 500);
  }
}
