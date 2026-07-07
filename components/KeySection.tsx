import KeyTree from "./KeyTree";
import MobileKeyStepper from "./MobileKeyStepper";
import SectionHeading from "./SectionHeading";
import Reveal from "./Reveal";

export default function KeySection() {
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
          {/* Desktop / tablet: full SVG tree */}
          <div className="mt-8 hidden md:block">
            <KeyTree />
          </div>
          {/* Mobile: vertical step-through */}
          <div className="mt-8 md:hidden">
            <MobileKeyStepper />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
