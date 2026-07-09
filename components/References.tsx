import type { Organism, RefEntry } from "@/lib/types";
import Rich from "./Rich";
import SectionHeading from "./SectionHeading";
import Reveal from "./Reveal";

export default function References({
  references,
  organisms,
}: {
  references: RefEntry[];
  organisms: Organism[];
}) {
  // Every photograph's APA credit, gathered from the organisms and sorted
  // alphabetically the way an APA reference list is ordered.
  const imageCredits = organisms
    .filter((o) => o.caption)
    .map((o) => ({ id: o.id, caption: o.caption }))
    .sort((a, b) => a.caption.localeCompare(b.caption));

  return (
    <section id="references" className="scroll-mt-20 py-16">
      <div className="section-shell">
        <Reveal>
          <SectionHeading title="References" />
        </Reveal>

        <Reveal delay={0.1}>
          <ol className="mt-6 space-y-4">
            {references.map((r) => (
              <li key={r.id} className="on-dark break-words border-b border-teal-line/50 pb-4 pl-8 -indent-8 text-sm leading-relaxed text-cream">
                <Rich html={r.entry} />
              </li>
            ))}
          </ol>

          {imageCredits.length > 0 && (
            <details className="mt-8 rounded-md border border-teal-line/60 bg-ink-2/50 px-4 py-3">
              <summary className="cursor-pointer select-none text-sm font-semibold text-cream marker:text-copper hover:text-copper-soft">
                Image credits (APA): all {imageCredits.length} photographs
              </summary>
              <ol className="mt-4 space-y-4">
                {imageCredits.map((c) => (
                  <li key={c.id} className="on-dark break-words border-b border-teal-line/40 pb-4 pl-8 -indent-8 text-sm leading-relaxed text-cream-dim">
                    <Rich html={c.caption} />
                  </li>
                ))}
              </ol>
            </details>
          )}
        </Reveal>
      </div>
    </section>
  );
}
