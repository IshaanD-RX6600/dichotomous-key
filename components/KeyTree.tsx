"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { regionMeta, kingdomMeta, findRoot } from "@/lib/display";
import type { KeyNode, Organism } from "@/lib/types";
import Rich from "./Rich";
import ImagePlaceholder from "./ImagePlaceholder";

const NODE_W = 200;
const NODE_H = 66;
const COL_GAP = 258;
const ROW_GAP = 96;
const PAD = 48;

export default function KeyTree({
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
  const [hovered, setHovered] = useState<string | null>(null);
  const [fit, setFit] = useState(true);
  const shellRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  /* Layout: each leaf a row, each parent the mean of its children. */
  const { pos, width, height } = useMemo(() => {
    const pos: Record<string, { col: number; row: number }> = {};
    let leaf = 0;
    const seen = new Set<string>();
    const place = (id: string, col: number): number => {
      if (isOrg(id) || !nodeMap.has(id) || seen.has(id)) {
        const row = leaf;
        leaf += 1;
        pos[id] = { col, row };
        return row;
      }
      seen.add(id);
      const q = nodeMap.get(id)!;
      const ra = place(q.a_target, col + 1);
      const rb = place(q.b_target, col + 1);
      const row = (ra + rb) / 2;
      pos[id] = { col, row };
      return row;
    };
    place(rootId, 0);
    const cols = Math.max(0, ...Object.values(pos).map((p) => p.col));
    const width = PAD * 2 + cols * COL_GAP + NODE_W;
    const height = PAD * 2 + Math.max(0, leaf - 1) * ROW_GAP + NODE_H;
    return { pos, width, height };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, organisms]);

  /* Fit-to-screen: scale the whole diagram down so its full width and height
     fit the container/viewport, letting the entire tree be seen at once. */
  useEffect(() => {
    const el = shellRef.current;
    if (!el) return;
    const compute = () => {
      if (!fit) {
        setScale(1);
        return;
      }
      const availW = el.clientWidth;
      const availH = Math.max(340, window.innerHeight * 0.78);
      setScale(Math.min(1, availW / width, availH / height));
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    window.addEventListener("resize", compute);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", compute);
    };
  }, [fit, width, height]);

  const pathTo = (id: string): string[] => {
    const parent: Record<string, string> = {};
    nodes.forEach((n) => {
      parent[n.a_target] = n.id;
      parent[n.b_target] = n.id;
    });
    const arr = [id];
    let cur = id;
    let guard = 0;
    while (parent[cur] && guard < 100) {
      cur = parent[cur];
      arr.unshift(cur);
      guard += 1;
    }
    return arr;
  };

  const left = (id: string) => PAD + (pos[id]?.col ?? 0) * COL_GAP;
  const top = (id: string) => PAD + (pos[id]?.row ?? 0) * ROW_GAP;
  const cy = (id: string) => top(id) + NODE_H / 2;

  const edges = useMemo(() => {
    const list: { from: string; to: string }[] = [];
    nodes.forEach((n) => {
      if (n.a_target) list.push({ from: n.id, to: n.a_target });
      if (n.b_target) list.push({ from: n.id, to: n.b_target });
    });
    return list.filter((e) => pos[e.from] && pos[e.to]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, pos]);

  const litPairs = useMemo(() => {
    const s = new Set<string>();
    for (let i = 0; i < path.length - 1; i += 1) s.add(`${path[i]}>${path[i + 1]}`);
    return s;
  }, [path]);

  const frontier = path[path.length - 1];

  const selectChoice = (nodeId: string, key: "a" | "b") => {
    const n = nodeMap.get(nodeId)!;
    const target = key === "a" ? n.a_target : n.b_target;
    if (!target) return;
    setPath([...pathTo(nodeId), target]);
  };

  const nodeLabel = (id: string) =>
    isOrg(id) ? orgMap.get(id)!.common : `Q${nodeMap.get(id)?.num ?? "?"}`;
  const choiceShort = (parent: string, child: string) => {
    const n = nodeMap.get(parent);
    if (!n) return "";
    return n.a_target === child ? n.a_short : n.b_short;
  };

  const allIds = [...nodes.map((n) => n.id), ...organisms.map((o) => o.id)].filter(
    (id) => pos[id]
  );

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <button
          onClick={() => setPath([rootId])}
          className="rounded-md border border-copper/50 bg-copper/10 px-4 py-2 text-sm font-semibold text-copper-soft transition-colors hover:bg-copper/20"
        >
          ↺ Reset path
        </button>
        <button
          onClick={() => setFit((f) => !f)}
          aria-pressed={fit}
          className="rounded-md border border-copper/50 bg-copper/10 px-4 py-2 text-sm font-semibold text-copper-soft transition-colors hover:bg-copper/20"
        >
          {fit ? "🔍 Actual size" : "⤢ Fit to screen"}
        </button>
        <p className="text-sm text-cream-dim">
          Click a couplet&rsquo;s <b className="text-copper-soft">a</b>/<b className="text-copper-soft">b</b> choice to light a branch. Hover or focus any node to enlarge it.
        </p>
      </div>

      <div className="mb-4 rounded-md border border-teal-line/60 bg-ink-2/50 p-3">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-copper">Your path</p>
        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-2 text-sm">
          {path.map((id, i) => (
            <span key={`${id}-${i}`} className="flex items-center gap-1.5">
              <span className={`rounded px-2 py-1 font-medium ${isOrg(id) ? "bg-copper text-ink" : "bg-ink-3 text-cream"}`}>
                {nodeLabel(id)}
              </span>
              {i < path.length - 1 && (
                <>
                  <span className="text-copper">→</span>
                  <span className="italic text-cream-dim">{choiceShort(id, path[i + 1])}</span>
                  <span className="text-copper">→</span>
                </>
              )}
            </span>
          ))}
          {isOrg(frontier) && (
            <span className="ml-1 rounded bg-copper/20 px-2 py-1 text-xs font-semibold text-copper-soft">
              ✔ identified: <i>{orgMap.get(frontier)!.binomial}</i>
            </span>
          )}
        </div>
      </div>

      <div className="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-cream-dim">
        {Object.values(regionMeta).map((r) => (
          <span key={r.name} className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded-sm" style={{ background: r.color }} />
            {r.name}
          </span>
        ))}
      </div>

      <div
        ref={shellRef}
        className={`tree-scroll rounded-lg border border-teal-line/60 bg-ink-2/30 ${fit ? "overflow-hidden" : "overflow-auto"}`}
        style={fit ? undefined : { maxHeight: "78vh" }}
      >
        <div className="relative mx-auto" style={{ width: fit ? width * scale : width, height: fit ? height * scale : height }}>
          <div
            className="absolute left-0 top-0"
            style={{ width, height, transform: fit ? `scale(${scale})` : undefined, transformOrigin: "top left" }}
          >
          <svg width={width} height={height} className="absolute inset-0" aria-hidden>
            {edges.map((e) => {
              const x1 = left(e.from) + NODE_W;
              const y1 = cy(e.from);
              const x2 = left(e.to);
              const y2 = cy(e.to);
              const dx = (x2 - x1) / 2;
              const lit = litPairs.has(`${e.from}>${e.to}`) || hovered === e.from || hovered === e.to;
              return (
                <path
                  key={`${e.from}>${e.to}`}
                  d={`M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`}
                  fill="none"
                  stroke={lit ? "#c67b47" : "#2c4a47"}
                  strokeWidth={lit ? 3 : 1.5}
                  style={lit ? { filter: "drop-shadow(0 0 4px rgba(198,123,71,.7))" } : undefined}
                />
              );
            })}
          </svg>

          {allIds.map((id) => {
            const active = hovered === id;
            const inPath = path.includes(id);
            const leaf = isOrg(id);
            const org = leaf ? orgMap.get(id)! : null;
            const node = leaf ? null : nodeMap.get(id)!;
            const region = leaf ? kingdomMeta[org!.kingdom] : regionMeta[node!.region];

            return (
              <motion.div
                key={id}
                className="absolute"
                style={{
                  left: left(id),
                  top: top(id),
                  width: NODE_W,
                  zIndex: active ? 50 : inPath ? 20 : 10,
                  transformOrigin: "left center",
                }}
                animate={{ scale: reduced || !active ? 1 : 1.06 }}
                transition={{ type: "spring", stiffness: 320, damping: 26 }}
                onMouseEnter={() => setHovered(id)}
                onMouseLeave={() => setHovered((h) => (h === id ? null : h))}
                onFocus={() => setHovered(id)}
                onBlur={() => setHovered((h) => (h === id ? null : h))}
              >
                <div
                  className={`card-parchment overflow-hidden transition-shadow ${
                    active ? "shadow-glow ring-2 ring-copper" : inPath ? "ring-2 ring-copper/70" : "ring-1 ring-black/10"
                  }`}
                >
                  <div style={{ height: 4, background: region.color }} />

                  {leaf ? (
                    <button onClick={() => setPath(pathTo(id))} className="block w-full p-3 text-left">
                      <span className="flex items-center gap-2">
                        <span className="inline-block h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: region.color }} />
                        <span className="font-display text-sm font-semibold leading-tight">{org!.common}</span>
                      </span>
                      <span className="mt-0.5 block text-xs italic text-copper-deep">{org!.binomial}</span>
                      {active && (
                        <div className="mt-2 border-t border-copper-deep/25 pt-2">
                          <p className="text-[0.68rem] font-medium text-bodyink/70">{org!.grp}</p>
                          <ul className="mt-1.5 space-y-1">
                            {org!.traits.slice(0, 3).map((t, i) => (
                              <li key={i} className="flex gap-1.5 text-[0.72rem] leading-snug">
                                <span className="text-copper-deep">•</span>
                                <Rich html={t} />
                              </li>
                            ))}
                          </ul>
                          <ImagePlaceholder organism={org!} className="mt-2 h-16 text-[0.6rem]" />
                        </div>
                      )}
                    </button>
                  ) : (
                    <div className="p-3">
                      <button onClick={() => setPath(pathTo(id))} className="block w-full text-left">
                        <span className="flex items-center gap-2">
                          <span className="flex h-5 min-w-[1.4rem] items-center justify-center rounded px-1 font-display text-[0.7rem] font-bold text-white" style={{ background: region.color }}>
                            {node!.num}
                          </span>
                          <span className="text-xs font-semibold leading-tight text-bodyink">{node!.short}</span>
                        </span>
                      </button>
                      {active && (
                        <Rich as="p" html={node!.question} className="card-parchment mt-2 block text-[0.72rem] leading-snug text-bodyink/85" />
                      )}
                      <div className="mt-2 flex flex-col gap-1">
                        {(["a", "b"] as const).map((k) => {
                          const target = k === "a" ? node!.a_target : node!.b_target;
                          const isLit = litPairs.has(`${id}>${target}`);
                          const isNext = frontier === id || isLit;
                          return (
                            <button
                              key={k}
                              onClick={(e) => {
                                e.stopPropagation();
                                selectChoice(id, k);
                              }}
                              className={`flex items-start gap-1.5 rounded border px-2 py-1 text-left text-[0.7rem] leading-snug transition-colors ${
                                isLit
                                  ? "border-copper bg-copper/20 text-copper-deep"
                                  : isNext
                                    ? "border-copper-deep/40 bg-white/40 text-bodyink hover:bg-copper/10"
                                    : "border-black/10 bg-white/25 text-bodyink/80 hover:bg-copper/10"
                              }`}
                            >
                              <span className="font-bold uppercase">{k}</span>
                              {active ? (
                                <Rich html={k === "a" ? node!.a_label : node!.b_label} />
                              ) : (
                                <span>{k === "a" ? node!.a_short : node!.b_short}</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
          </div>
        </div>
      </div>
      <p className="mt-3 text-center text-xs text-cream-dim">
        {fit
          ? "Whole tree shown to scale — switch to Actual size to zoom in, hover, and interact. On a phone, use the step-through version below."
          : "Wide diagram — scroll to pan. On a phone, use the step-through version below."}
      </p>
    </div>
  );
}
