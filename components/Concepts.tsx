import { concepts } from "@/lib/keyData";
import Rich from "./Rich";
import SectionHeading from "./SectionHeading";
import Reveal from "./Reveal";

export default function Concepts() {
  return (
    <section id="concepts" className="scroll-mt-20 py-16">
      <div className="section-shell">
        <Reveal>
          <SectionHeading
            eyebrow="The biology behind the key"
            title="Biology concepts"
            lead="Short write-ups connecting the key to core SBI3U ideas. <b>Key terms</b> are bolded throughout."
          />
        </Reveal>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {concepts.map((c, i) => (
            <Reveal key={c.heading} delay={i * 0.06}>
              <article className="card-parchment h-full p-6">
                <h3 className="font-display text-xl">{c.heading}</h3>
                <hr className="my-3 border-parchment-line" />
                <Rich as="p" html={c.body} className="text-sm leading-relaxed" />
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
