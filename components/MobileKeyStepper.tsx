"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  questions,
  species,
  rootId,
  regionMeta,
  kingdomMeta,
  isSpecies,
} from "@/lib/keyData";
import Rich from "./Rich";
import ImagePlaceholder from "./ImagePlaceholder";

/* Vertical step-through key for small screens (a wide tree won't fit). */
export default function MobileKeyStepper() {
  const reduced = useReducedMotion();
  const [path, setPath] = useState<string[]>([rootId]);
  const current = path[path.length - 1];

  const choose = (key: "a" | "b") => {
    setPath((p) => [...p, questions[current][key].to]);
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
      {/* breadcrumb */}
      <div className="mb-3 flex flex-wrap gap-1.5 text-xs">
        {path.map((id) => (
          <span
            key={id}
            className={`rounded px-2 py-1 font-medium ${
              isSpecies(id) ? "bg-copper text-ink" : "bg-ink-3 text-cream"
            }`}
          >
            {isSpecies(id) ? species[id].common : `Q${questions[id].num}`}
          </span>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={current} {...anim}>
          {isSpecies(current) ? (
            <SpeciesResult id={current} />
          ) : (
            <div className="card-parchment p-5">
              <div
                className="mb-2 inline-flex items-center gap-2 rounded px-2 py-1 text-xs font-semibold text-white"
                style={{ background: regionMeta[questions[current].region].color }}
              >
                Couplet {questions[current].num}
              </div>
              <Rich
                as="p"
                html={questions[current].question}
                className="font-display text-lg leading-snug text-bodyink"
              />
              <div className="mt-4 grid gap-2">
                {(["a", "b"] as const).map((k) => (
                  <button
                    key={k}
                    onClick={() => choose(k)}
                    className="flex items-start gap-2 rounded-md border border-copper-deep/40 bg-white/50 px-3 py-2.5 text-left text-sm text-bodyink transition-colors hover:bg-copper/15"
                  >
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-copper text-xs font-bold text-ink">
                      {k}
                    </span>
                    <Rich html={questions[current][k].label} />
                  </button>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="mt-4 flex gap-2">
        <button
          onClick={back}
          disabled={path.length < 2}
          className="rounded-md border border-teal-line bg-ink-2 px-4 py-2 text-sm font-semibold text-cream disabled:opacity-40"
        >
          ← Back
        </button>
        <button
          onClick={reset}
          className="rounded-md border border-copper/50 bg-copper/10 px-4 py-2 text-sm font-semibold text-copper-soft"
        >
          ↺ Start over
        </button>
      </div>
    </div>
  );
}

function SpeciesResult({ id }: { id: string }) {
  const s = species[id];
  const k = kingdomMeta[s.kingdom];
  return (
    <div className="card-parchment overflow-hidden">
      <div style={{ height: 5, background: k.color }} />
      <div className="p-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-copper-deep">
          ✔ Identified
        </p>
        <h3 className="mt-1 font-display text-2xl">{s.common}</h3>
        <p className="italic text-copper-deep">{s.binomial}</p>
        <p className="mt-1 inline-block rounded bg-black/5 px-2 py-1 text-xs text-bodyink/70">
          {s.group}
        </p>
        <div className="mt-3 rounded-md border border-dashed border-copper-deep/40 bg-white/40 p-3">
          <Rich
            html={`<b>Why you landed here:</b> ${s.diagnostic}`}
            className="text-sm leading-snug"
          />
        </div>
        <ImagePlaceholder species={s} className="mt-3 h-28" />
        <p className="mt-2 text-[0.7rem] italic text-bodyink/60">
          <Rich html={s.caption} />
        </p>
      </div>
    </div>
  );
}
