import KeyTree from "./KeyTree";
import MobileKeyStepper from "./MobileKeyStepper";
import SectionHeading from "./SectionHeading";
import Reveal from "./Reveal";
import { kingdomMeta, kingdomOrder } from "@/lib/display";
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

        {/* Forest-region label + kingdom colour legend, right where a grader
            looks first. Kingdom colours are consistent across the tree, the
            species cards, and the key table; copper stays the selected path. */}
        <Reveal delay={0.05}>
          <div className="mt-6 flex flex-col gap-3 rounded-lg border border-teal-line/60 bg-ink-2/50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm">
              <span className="font-semibold uppercase tracking-wide text-copper">Forest Region:</span>{" "}
              <span className="text-cream">Great Lakes–St. Lawrence · Ontario</span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-cream-dim">
              <span className="font-semibold uppercase tracking-wide">Colour key</span>
              {kingdomOrder.map((key) => (
                <span key={key} className="flex items-center gap-1.5">
                  <span className="inline-block h-3 w-3 rounded-sm" style={{ background: kingdomMeta[key].color }} />
                  {kingdomMeta[key].name}
                </span>
              ))}
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-3 w-3 rounded-sm bg-copper" />
                Selected path
              </span>
            </div>
          </div>
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
