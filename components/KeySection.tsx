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
            lead="Every path down this branching tree ends at one organism. <b>Click</b> the choices to light up a route, or <b>hover / focus</b> any node to enlarge it and read the full detail. Connectors highlight in copper as you go."
          />
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-8 hidden md:block">
            <KeyTree nodes={nodes} organisms={organisms} />
          </div>
          <div className="mt-8 md:hidden">
            <MobileKeyStepper nodes={nodes} organisms={organisms} />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
