"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { regionMeta, kingdomMeta, findRoot } from "@/lib/display";
import type { KeyNode, Organism } from "@/lib/types";
import Rich from "./Rich";
import ImagePlaceholder from "./ImagePlaceholder";

/* Compact, top-to-bottom dendrogram geometry (unscaled diagram units). The
   whole diagram is then scaled with a single transform so it fits the viewport
   at once — see the fit-to-screen effect below. */
const NODE_W = 150; // node box width (also the connector attach width)
const NODE_H = 46; // compact node box height
const SLOT_W = 158; // horizontal distance between adjacent leaf columns
const LEVEL_H = 98; // vertical distance between tree levels
const PAD = 28; // padding around the diagram so nothing clips at the edges
const MIN_SCALE = 0.4; // never shrink below this; smaller screens pan instead

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
  // `pinned` keeps a node enlarged on touch/keyboard, where there is no hover.
  const [pinned, setPinned] = useState<string | null>(null);

  // Fit-to-screen: fitScale sizes the whole tree to the container; zoom is the
  // optional manual multiplier on top (1 = fully fitted, the default).
  const shellRef = useRef<HTMLDivElement>(null);
  const [fitScale, setFitScale] = useState(0.4);
  const [fitsToScreen, setFitsToScreen] = useState(true);
  const [zoom, setZoom] = useState(1);

  /* Layout: each leaf gets its own column (x); each parent sits at the mean x
     of its children. Depth drives y, so the root is at the top and the species
     endpoints are along the bottom — a clean top-down hierarchy. */
  const { pos, width, height } = useMemo(() => {
    const pos: Record<string, { x: number; depth: number }> = {};
    let leaf = 0;
    let maxDepth = 0;
    const seen = new Set<string>();
    const place = (id: string, depth: number): number => {
      maxDepth = Math.max(maxDepth, depth);
      if (isOrg(id) || !nodeMap.has(id) || seen.has(id)) {
        const x = leaf * SLOT_W;
        leaf += 1;
        pos[id] = { x, depth };
        return x;
      }
      seen.add(id);
      const q = nodeMap.get(id)!;
      const xa = place(q.a_target, depth + 1);
      const xb = place(q.b_target, depth + 1);
      const x = (xa + xb) / 2;
      pos[id] = { x, depth };
      return x;
    };
    place(rootId, 0);
    const width = PAD * 2 + Math.max(0, leaf - 1) * SLOT_W + NODE_W;
    const height = PAD * 2 + maxDepth * LEVEL_H + NODE_H;
    return { pos, width, height };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, organisms]);

  /* Recompute the fit scale from the tree's bounding box whenever the container
     or window changes, so the entire tree is always visible in one view. */
  useEffect(() => {
    const el = shellRef.current;
    if (!el) return;
    const compute = () => {
      const availW = el.clientWidth - 8;
      if (availW <= 0) return; // not laid out yet — keep last value
      const availH = Math.max(300, Math.min(window.innerHeight * 0.8, 820));
      const raw = Math.min(availW / width, availH / height); // scale to fully fit
      // Never shrink below a legible minimum; on very small screens the tree
      // becomes pannable at MIN_SCALE instead of an unreadable speck.
      setFitScale(Math.min(1, Math.max(raw, MIN_SCALE)));
      setFitsToScreen(raw >= MIN_SCALE);
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    window.addEventListener("resize", compute);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", compute);
    };
  }, [width, height]);

  const scale = fitScale * zoom;
  const zoomedIn = zoom > 1.001;
  // When the tree can't fully fit legibly (small screens) or the user zoomed
  // in, make the canvas pannable instead of clipping it.
  const panning = zoomedIn || !fitsToScreen;

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

  const left = (id: string) => PAD + (pos[id]?.x ?? 0);
  const top = (id: string) => PAD + (pos[id]?.depth ?? 0) * LEVEL_H;
  const cx = (id: string) => left(id) + NODE_W / 2;
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

  // How much a hovered/focused node grows: enough to read at the current fit
  // (≈ actual size), capped so it stays a tidy overlay.
  const hoverScale = Math.min(2.6, Math.max(1.08, 1 / scale));

  const btnZoom =
    "flex h-7 w-7 items-center justify-center rounded text-sm font-bold text-cream-dim transition-colors hover:bg-copper/20 hover:text-copper-soft disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <button
          onClick={() => setPath([rootId])}
          className="rounded-md border border-copper/50 bg-copper/10 px-4 py-2 text-sm font-semibold text-copper-soft transition-colors hover:bg-copper/20"
        >
          ↺ Reset path
        </button>
        <div className="flex items-center gap-1 rounded-md border border-teal-line/60 bg-ink-2/50 p-1">
          <button className={btnZoom} onClick={() => setZoom((z) => Math.max(1, +(z - 0.25).toFixed(2)))} disabled={zoom <= 1} aria-label="Zoom out" title="Zoom out">−</button>
          <button
            className="rounded px-2 py-1 text-xs font-semibold text-cream-dim transition-colors hover:bg-copper/20 hover:text-copper-soft"
            onClick={() => setZoom(1)}
            title="Fit the whole tree to the screen"
          >
            {zoomedIn ? "⤢ Fit" : "Fitted"}
          </button>
          <button className={btnZoom} onClick={() => setZoom((z) => Math.min(3, +(z + 0.25).toFixed(2)))} disabled={zoom >= 3} aria-label="Zoom in" title="Zoom in">+</button>
        </div>
        <p className="text-sm text-cream-dim">
          The tree scales to fit your screen. <b className="text-copper-soft">Hover</b> or <b className="text-copper-soft">tap</b> any node to enlarge it and pick its <b className="text-copper-soft">a</b>/<b className="text-copper-soft">b</b> choice.
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
        className={`tree-scroll w-full ${panning ? "overflow-auto" : "overflow-visible"}`}
        style={panning ? { maxHeight: "80vh" } : undefined}
      >
        <div className="relative mx-auto" style={{ width: width * scale, height: height * scale }}>
          <div
            className="absolute left-0 top-0"
            style={{ width, height, transform: `scale(${scale})`, transformOrigin: "top left" }}
          >
            <svg width={width} height={height} className="absolute inset-0" aria-hidden>
              {edges.map((e) => {
                const x1 = cx(e.from);
                const y1 = cy(e.from);
                const x2 = cx(e.to);
                const y2 = cy(e.to);
                const my = (y1 + y2) / 2;
                const lit =
                  litPairs.has(`${e.from}>${e.to}`) ||
                  hovered === e.from || hovered === e.to ||
                  pinned === e.from || pinned === e.to;
                return (
                  <path
                    key={`${e.from}>${e.to}`}
                    d={`M ${x1} ${y1} C ${x1} ${my}, ${x2} ${my}, ${x2} ${y2}`}
                    fill="none"
                    stroke={lit ? "#c67b47" : "#2c4a47"}
                    strokeWidth={lit ? 3 : 1.5}
                    style={lit ? { filter: "drop-shadow(0 0 4px rgba(198,123,71,.7))" } : undefined}
                  />
                );
              })}
            </svg>

            {allIds.map((id) => {
              const active = hovered === id || pinned === id;
              const inPath = path.includes(id);
              const leaf = isOrg(id);
              const org = leaf ? orgMap.get(id)! : null;
              const node = leaf ? null : nodeMap.get(id)!;
              const region = leaf ? kingdomMeta[org!.kingdom] : regionMeta[node!.region];

              // Expand a hovered node toward the interior so it stays on-screen.
              const ox = cx(id) < width * 0.22 ? "left" : cx(id) > width * 0.78 ? "right" : "center";
              const oy = top(id) < height * 0.25 ? "top" : top(id) > height * 0.7 ? "bottom" : "center";

              return (
                <motion.div
                  key={id}
                  className="absolute"
                  style={{
                    left: left(id),
                    top: top(id),
                    width: NODE_W,
                    zIndex: active ? 60 : inPath ? 20 : 10,
                    transformOrigin: `${ox} ${oy}`,
                  }}
                  animate={{ scale: reduced || !active ? 1 : hoverScale }}
                  transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 320, damping: 26 }}
                  onMouseEnter={() => {
                    setHovered(id);
                    setPinned((p) => (p && p !== id ? null : p));
                  }}
                  onMouseLeave={() => setHovered((h) => (h === id ? null : h))}
                  onPointerDown={(e) => {
                    if (e.pointerType === "touch") setPinned(id);
                  }}
                  onFocus={() => setPinned(id)}
                  onBlur={(e) => {
                    // Only collapse when focus leaves the node entirely — moving
                    // between the header and its a/b buttons (e.g. a tap on a
                    // touch device) must keep it open so the choice registers.
                    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
                      setPinned((p) => (p === id ? null : p));
                    }
                  }}
                >
                  <div
                    className={`card-parchment overflow-hidden transition-shadow ${
                      active ? "shadow-glow ring-2 ring-copper" : inPath ? "ring-2 ring-copper/70" : "ring-1 ring-black/10"
                    }`}
                    style={{ minHeight: NODE_H }}
                  >
                    <div style={{ height: 3, background: region.color }} />

                    {leaf ? (
                      <button onClick={() => setPath(pathTo(id))} className="block w-full p-2 text-left">
                        <span className="flex items-center gap-1.5">
                          <span className="inline-block h-2 w-2 shrink-0 rounded-full" style={{ background: region.color }} />
                          <span className="font-display text-[0.72rem] font-semibold leading-tight">{org!.common}</span>
                        </span>
                        {active && (
                          <div className="mt-1.5 border-t border-copper-deep/25 pt-1.5">
                            <p className="text-[0.66rem] italic text-copper-deep">{org!.binomial}</p>
                            <p className="mt-0.5 text-[0.62rem] font-medium text-bodyink/70">{org!.grp}</p>
                            <ul className="mt-1 space-y-0.5">
                              {org!.traits.slice(0, 3).map((t, i) => (
                                <li key={i} className="flex gap-1 text-[0.64rem] leading-snug">
                                  <span className="text-copper-deep">•</span>
                                  <Rich html={t} />
                                </li>
                              ))}
                            </ul>
                            <ImagePlaceholder organism={org!} className="mt-1.5 h-14 text-[0.55rem]" />
                          </div>
                        )}
                      </button>
                    ) : (
                      <div className="p-2">
                        <button onClick={() => setPath(pathTo(id))} className="block w-full text-left">
                          <span className="flex items-center gap-1.5">
                            <span className="flex h-4 min-w-[1.2rem] items-center justify-center rounded px-1 font-display text-[0.62rem] font-bold text-white" style={{ background: region.color }}>
                              {node!.num}
                            </span>
                            <span className="text-[0.66rem] font-semibold leading-tight text-bodyink line-clamp-2">{node!.short}</span>
                          </span>
                        </button>
                        {active && (
                          <>
                            <Rich as="p" html={node!.question} className="mt-1.5 block text-[0.66rem] leading-snug text-bodyink/85" />
                            <div className="mt-1.5 flex flex-col gap-1">
                              {(["a", "b"] as const).map((k) => {
                                const target = k === "a" ? node!.a_target : node!.b_target;
                                const isLit = litPairs.has(`${id}>${target}`);
                                return (
                                  <button
                                    key={k}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      selectChoice(id, k);
                                    }}
                                    className={`flex items-start gap-1.5 rounded border px-1.5 py-1 text-left text-[0.64rem] leading-snug transition-colors ${
                                      isLit
                                        ? "border-copper bg-copper/20 text-copper-deep"
                                        : "border-copper-deep/40 bg-white/40 text-bodyink hover:bg-copper/10"
                                    }`}
                                  >
                                    <span className="font-bold uppercase">{k}</span>
                                    <Rich html={k === "a" ? node!.a_label : node!.b_label} />
                                  </button>
                                );
                              })}
                            </div>
                          </>
                        )}
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
        Scaled to fit your screen top-to-bottom. Use <b>+ / −</b> to zoom, <b>Fit</b> to reset, and drag to pan when zoomed in. On a small screen you can also use the step-through below.
      </p>
    </div>
  );
}
