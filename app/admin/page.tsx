import AdminDashboard from "@/components/admin/AdminDashboard";
import { getSiteData, hasDb } from "@/lib/db";
import { seedMeta, seedOrganisms, seedNodes, seedConcepts, seedReferences } from "@/lib/keyData";
import type { SiteData } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  let data: SiteData;
  try {
    data = await getSiteData();
  } catch {
    data = {
      organisms: seedOrganisms,
      nodes: seedNodes,
      concepts: seedConcepts.map((c, i) => ({ id: i + 1, ...c })),
      references: seedReferences.map((r, i) => ({ id: i + 1, ...r })),
      meta: seedMeta,
    };
  }
  return <AdminDashboard initial={data} hasDb={hasDb} />;
}
