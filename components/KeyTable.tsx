import {
  questions,
  questionOrder,
  species,
  regionMeta,
  isSpecies,
} from "@/lib/keyData";
import Rich from "./Rich";
import SectionHeading from "./SectionHeading";
import Reveal from "./Reveal";

function targetCell(to: string) {
  if (isSpecies(to)) {
    return (
      <span>
        <i className="text-copper-deep">{species[to].binomial}</i>{" "}
        <span className="text-bodyink/60">({species[to].common})</span>
      </span>
    );
  }
  return <span className="font-semibold text-copper-deep">→ Couplet {questions[to].num}</span>;
}

function leadsToImages(id: string) {
  const q = questions[id];
  const leaves = [q.a.to, q.b.to].filter(isSpecies).map((t) => species[t]);
  if (leaves.length === 0) return <span className="text-bodyink/50">continues</span>;
  return (
    <span className="flex flex-wrap gap-1">
      {leaves.map((s) => (
        <span
          key={s.binomial}
          className="inline-flex items-center gap-1 rounded border border-dashed border-copper-deep/40 bg-white/40 px-1.5 py-0.5 text-[0.68rem] text-copper-deep"
        >
          🖼️ {s.common}
        </span>
      ))}
    </span>
  );
}

export default function KeyTable() {
  return (
    <section id="table" className="scroll-mt-20 py-16">
      <div className="section-shell">
        <Reveal>
          <SectionHeading
            eyebrow="Static reference"
            title="Full key table"
            lead="The complete key as a numbered reference. Each <b>couplet</b> offers choice <b>a</b> and choice <b>b</b>; rows are <b>colour-coded</b> by the branch of life they sort."
          />
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-8 overflow-x-auto rounded-lg border border-teal-line/60">
            <table className="w-full min-w-[760px] border-collapse text-sm">
              <thead>
                <tr className="bg-ink-3 text-left font-display text-cream">
                  <th className="p-3">#</th>
                  <th className="p-3">Question / couplet</th>
                  <th className="p-3">Direction</th>
                  <th className="p-3">Leads to</th>
                </tr>
              </thead>
              <tbody>
                {questionOrder.map((id) => {
                  const q = questions[id];
                  const color = regionMeta[q.region].color;
                  return (
                    <tr key={id} className="bg-parchment text-bodyink card-parchment">
                      <td
                        className="border-b border-parchment-line p-3 align-top font-display font-bold"
                        style={{ borderLeft: `6px solid ${color}` }}
                      >
                        {q.num}
                      </td>
                      <td className="border-b border-parchment-line p-3 align-top">
                        <span
                          className="mb-1 inline-block rounded px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-white"
                          style={{ background: color }}
                        >
                          {regionMeta[q.region].name}
                        </span>
                        <Rich as="div" html={q.question} />
                      </td>
                      <td className="border-b border-parchment-line p-3 align-top">
                        <div className="mb-1.5">
                          <span className="mr-1 inline-block rounded bg-copper px-1.5 font-bold text-ink">a</span>
                          <Rich html={q.a.label} />
                          <div className="ml-6 mt-0.5">{targetCell(q.a.to)}</div>
                        </div>
                        <div>
                          <span className="mr-1 inline-block rounded bg-copper-deep px-1.5 font-bold text-white">b</span>
                          <Rich html={q.b.label} />
                          <div className="ml-6 mt-0.5">{targetCell(q.b.to)}</div>
                        </div>
                      </td>
                      <td className="border-b border-parchment-line p-3 align-top">
                        {leadsToImages(id)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
