"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { regionMeta, kingdomMeta, findRoot } from "@/lib/display";
import type { KeyNode, Organism } from "@/lib/types";
import Rich from "./Rich";
import ImagePlaceholder from "./ImagePlaceholder";

export default function MobileKeyStepper({
  nodes,
  organisms,
}: {
  nodes: KeyNode[];
  organisms: Organism[];
}) {
  const reduced = useReducedMotion();
  const nodeMap = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);
  const orgMap = useMemo(() => new Map(organisms.map((o) => [o.id, o])), [organisms]);
  const rootId = useMemo(() => findRoot(nodes), [nodes]);
  const isOrg = (id: string) => orgMap.has(id);

  const [path, setPath] = useState<string[]>([rootId]);
  const current = path[path.length - 1];
  const node = nodeMap.get(current);

  const choose = (key: "a" | "b") => {
    const n = nodeMap.get(current);
    if (!n) return;
    const target = key === "a" ? n.a_target : n.b_target;
    if (target) setPath((p) => [...p, target]);
  };
  const back = () => setPath((p) => (p.length > 1 ? p.slice(0, -1) : p));
  const reset = () => setPath([rootId]);

  const anim = reduced
    ? {}
    : {
        initial: { opacity: 0, y: 16 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -16 },
        transition: { duration: 0.28 },
      };

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-1.5 text-xs">
        {path.map((id, i) => (
          <span key={`${id}-${i}`} className={`rounded px-2 py-1 font-medium ${isOrg(id) ? "bg-copper text-ink" : "bg-ink-3 text-cream"}`}>
            {isOrg(id) ? orgMap.get(id)!.common : `Q${nodeMap.get(id)?.num ?? "?"}`}
          </span>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={current} {...anim}>
          {isOrg(current) ? (
            <SpeciesResult organism={orgMap.get(current)!} />
          ) : node ? (
            <div className="card-parchment p-5">
              <div className="mb-2 inline-flex items-center gap-2 rounded px-2 py-1 text-xs font-semibold text-white" style={{ background: regionMeta[node.region].color }}>
                Couplet {node.num}
              </div>
              <Rich as="p" html={node.question} className="font-display text-lg leading-snug text-bodyink" />
              <div className="mt-4 grid gap-2">
                {(["a", "b"] as const).map((k) => (
                  <button
                    key={k}
                    onClick={() => choose(k)}
                    className="flex items-start gap-2 rounded-md border border-copper-deep/40 bg-white/50 px-3 py-2.5 text-left text-sm text-bodyink transition-colors hover:bg-copper/15"
                  >
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-copper text-xs font-bold text-ink">{k}</span>
                    <Rich html={k === "a" ? node.a_label : node.b_label} />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="card-parchment p-5 text-sm">This branch has no destination yet.</div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="mt-4 flex gap-2">
        <button onClick={back} disabled={path.length < 2} className="rounded-md border border-teal-line bg-ink-2 px-4 py-2 text-sm font-semibold text-cream disabled:opacity-40">
          ← Back
        </button>
        <button onClick={reset} className="rounded-md border border-copper/50 bg-copper/10 px-4 py-2 text-sm font-semibold text-copper-soft">
          ↺ Start over
        </button>
      </div>
    </div>
  );
}

function SpeciesResult({ organism }: { organism: Organism }) {
  const k = kingdomMeta[organism.kingdom];
  return (
    <div className="card-parchment overflow-hidden">
      <div style={{ height: 5, background: k.color }} />
      <div className="p-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-copper-deep">✔ Identified</p>
        <h3 className="mt-1 font-display text-2xl">{organism.common}</h3>
        <p className="italic text-copper-deep">{organism.binomial}</p>
        <p className="mt-1 inline-block rounded bg-black/5 px-2 py-1 text-xs text-bodyink/70">{organism.grp}</p>
        <div className="mt-3 rounded-md border border-dashed border-copper-deep/40 bg-white/40 p-3">
          <Rich html={`<b>Why you landed here:</b> ${organism.diagnostic}`} className="text-sm leading-snug" />
        </div>
        <ImagePlaceholder organism={organism} className="mt-3 h-28" />
        <p className="mt-2 text-[0.7rem] italic text-bodyink/60">
          <Rich html={organism.caption} />
        </p>
      </div>
    </div>
  );
}
