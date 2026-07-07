import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import KeySection from "@/components/KeySection";
import KeyTable from "@/components/KeyTable";
import SpeciesGallery from "@/components/SpeciesGallery";
import Concepts from "@/components/Concepts";
import References from "@/components/References";
import Rich from "@/components/Rich";
import { meta } from "@/lib/keyData";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <hr className="divider-botanical section-shell" />
        <KeySection />
        <hr className="divider-botanical section-shell" />
        <KeyTable />
        <hr className="divider-botanical section-shell" />
        <SpeciesGallery />
        <hr className="divider-botanical section-shell" />
        <Concepts />
        <hr className="divider-botanical section-shell" />
        <References />
      </main>
      <footer className="border-t border-teal-line/60 bg-ink-2/60 py-8">
        <div className="section-shell text-center">
          <Rich
            as="p"
            html={meta.footer}
            className="on-dark text-sm text-cream-dim"
          />
        </div>
      </footer>
    </>
  );
}
