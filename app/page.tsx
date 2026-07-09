import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import KeySection from "@/components/KeySection";
import KeyTable from "@/components/KeyTable";
import SpeciesGallery from "@/components/SpeciesGallery";
import Concepts from "@/components/Concepts";
import References from "@/components/References";
import Rich from "@/components/Rich";
import { LightboxProvider } from "@/components/Lightbox";
import { getSiteData } from "@/lib/db";
import { seedMeta } from "@/lib/keyData";

// Always read fresh from the database so admin edits are live for all visitors
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home() {
  let data;
  try {
    data = await getSiteData();
  } catch {
    // Never hard-crash the public site if the DB is briefly unavailable.
    const { seedOrganisms, seedNodes, seedConcepts, seedReferences } = await import("@/lib/keyData");
    const { plainifySiteData } = await import("@/lib/text");
    data = plainifySiteData({
      organisms: seedOrganisms,
      nodes: seedNodes,
      concepts: seedConcepts.map((c, i) => ({ id: i + 1, ...c })),
      references: seedReferences.map((r, i) => ({ id: i + 1, ...r })),
      meta: seedMeta,
    });
  }

  return (
    <LightboxProvider>
      <Nav />
      <main>
        <Hero meta={data.meta} />
        <hr className="divider-botanical section-shell" />
        <KeySection nodes={data.nodes} organisms={data.organisms} />
        <hr className="divider-botanical section-shell" />
        <KeyTable nodes={data.nodes} organisms={data.organisms} />
        <hr className="divider-botanical section-shell" />
        <SpeciesGallery organisms={data.organisms} />
        <hr className="divider-botanical section-shell" />
        <Concepts concepts={data.concepts} />
        <hr className="divider-botanical section-shell" />
        <References references={data.references} organisms={data.organisms} />
      </main>
      <footer className="border-t border-teal-line/60 bg-ink-2/60 py-8">
        <div className="section-shell text-center">
          <Rich as="p" html={data.meta.footer} className="on-dark text-sm text-cream-dim" />
          <a href="/admin" className="mt-2 inline-block text-xs text-cream-dim underline hover:text-copper-soft">
            Admin
          </a>
        </div>
      </footer>
    </LightboxProvider>
  );
}
