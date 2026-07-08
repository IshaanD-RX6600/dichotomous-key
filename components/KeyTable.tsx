import { regionMeta } from "@/lib/display";
import type { KeyNode, Organism } from "@/lib/types";
import Rich from "./Rich";
import SectionHeading from "./SectionHeading";
import Reveal from "./Reveal";

export default function KeyTable({
  nodes,
  organisms,
}: {
  nodes: KeyNode[];
  organisms: Organism[];
}) {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const orgMap = new Map(organisms.map((o) => [o.id, o]));

  const targetCell = (to: string) => {
    const org = orgMap.get(to);
    if (org) {
      return (
        <span>
          <i className="text-copper-deep">{org.binomial}</i>{" "}
          <span className="text-bodyink/60">({org.common})</span>
        </span>
      );
    }
    const n = nodeMap.get(to);
    return <span className="font-semibold text-copper-deep">→ Couplet {n ? n.num : to || "—"}</span>;
  };

  const leadsToImages = (n: KeyNode) => {
    const leaves = [n.a_target, n.b_target].map((t) => orgMap.get(t)).filter(Boolean);
    if (leaves.length === 0) return <span className="text-bodyink/50">continues</span>;
    return (
      <span className="flex flex-wrap gap-1">
        {leaves.map((o) => (
          <span key={o!.id} className="inline-flex items-center gap-1 rounded border border-dashed border-copper-deep/40 bg-white/40 px-1.5 py-0.5 text-[0.68rem] text-copper-deep">
            🖼️ {o!.common}
          </span>
        ))}
      </span>
    );
  };

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
                {nodes.map((n) => {
                  const color = regionMeta[n.region].color;
                  return (
                    <tr key={n.id} className="card-parchment bg-parchment text-bodyink">
                      <td className="border-b border-parchment-line p-3 align-top font-display font-bold" style={{ borderLeft: `6px solid ${color}` }}>
                        {n.num}
                      </td>
                      <td className="border-b border-parchment-line p-3 align-top">
                        <span className="mb-1 inline-block rounded px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-white" style={{ background: color }}>
                          {regionMeta[n.region].name}
                        </span>
                        <Rich as="div" html={n.question} />
                      </td>
                      <td className="border-b border-parchment-line p-3 align-top">
                        <div className="mb-1.5">
                          <span className="mr-1 inline-block rounded bg-copper px-1.5 font-bold text-ink">a</span>
                          <Rich html={n.a_label} />
                          <div className="ml-6 mt-0.5">{targetCell(n.a_target)}</div>
                        </div>
                        <div>
                          <span className="mr-1 inline-block rounded bg-copper-deep px-1.5 font-bold text-white">b</span>
                          <Rich html={n.b_label} />
                          <div className="ml-6 mt-0.5">{targetCell(n.b_target)}</div>
                        </div>
                      </td>
                      <td className="border-b border-parchment-line p-3 align-top">{leadsToImages(n)}</td>
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
