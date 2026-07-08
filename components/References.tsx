import type { RefEntry, SiteMetaData } from "@/lib/types";
import Rich from "./Rich";
import SectionHeading from "./SectionHeading";
import Reveal from "./Reveal";

export default function References({
  references,
  meta,
}: {
  references: RefEntry[];
  meta: SiteMetaData;
}) {
  return (
    <section id="references" className="scroll-mt-20 py-16">
      <div className="section-shell">
        <Reveal>
          <SectionHeading eyebrow="Sources" title="References" />
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-6 rounded-md border-l-4 border-copper bg-ink-2/60 p-4">
            <Rich as="p" html={meta.referencesNote} className="on-dark text-sm text-cream-dim" />
          </div>

          <ol className="mt-6 space-y-4">
            {references.map((r) => (
              <li key={r.id} className="on-dark border-b border-teal-line/50 pb-4 pl-8 -indent-8 text-sm leading-relaxed text-cream">
                <Rich html={r.entry} />
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
    </section>
  );
}
