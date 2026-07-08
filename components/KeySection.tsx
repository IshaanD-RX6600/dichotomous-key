import KeyTree from "./KeyTree";
import MobileKeyStepper from "./MobileKeyStepper";
import SectionHeading from "./SectionHeading";
import Reveal from "./Reveal";
import type { KeyNode, Organism } from "@/lib/types";

export default function KeySection({
  nodes,
  organisms,
}: {
  nodes: KeyNode[];
  organisms: Organism[];
}) {
  return (
    <section id="tree" className="scroll-mt-20 py-16">
      <div className="section-shell">
        <Reveal>
          <SectionHeading
            eyebrow="The centerpiece"
            title="The Key as an interactive tree"
            lead="Every path down this branching tree ends at one organism. <b>Click</b> the choices to light up a route, or <b>hover / tap</b> any node to enlarge it and read the full detail. Connectors highlight in copper as you go."
          />
        </Reveal>
      </div>

      {/* The tree canvas gets a wider container than the text column so it can
          render larger. It works on every device: it fits fully on bigger
          screens and becomes pannable on small ones. */}
      <Reveal delay={0.1} className="mt-8">
        <div className="mx-auto max-w-[1700px] px-4 md:px-8">
          <KeyTree nodes={nodes} organisms={organisms} />
        </div>
      </Reveal>

      {/* Small screens also get the simpler linear step-through. */}
      <div className="section-shell mt-10 md:hidden">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-copper">
          Or step through it one couplet at a time
        </p>
        <MobileKeyStepper nodes={nodes} organisms={organisms} />
      </div>
    </section>
  );
}
