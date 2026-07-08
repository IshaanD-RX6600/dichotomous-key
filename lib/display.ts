/* Presentation constants + small graph helpers (not stored in the DB). */
import type { KeyNode, KingdomKey, Organism, RegionKey } from "./types";

export const regionMeta: Record<RegionKey, { name: string; color: string }> = {
  root: { name: "Foundation", color: "#9a854f" },
  micro: { name: "Prokaryotes & Protists", color: "#2f8a9a" },
  fungi: { name: "Fungi", color: "#8a4a6e" },
  split: { name: "Plant vs Animal", color: "#b06a34" },
  plant: { name: "Plantae", color: "#4a8a63" },
  animal: { name: "Animalia", color: "#c07030" },
};

export const kingdomMeta: Record<KingdomKey, { name: string; color: string }> = {
  plantae: { name: "Kingdom Plantae", color: "#4a8a63" },
  animalia: { name: "Kingdom Animalia", color: "#c07030" },
  fungi: { name: "Kingdom Fungi", color: "#8a4a6e" },
  micro: { name: "Prokaryotes & Protists", color: "#2f8a9a" },
};

export const kingdomOrder: KingdomKey[] = ["plantae", "animalia", "fungi", "micro"];

export const regionKeys: RegionKey[] = ["root", "micro", "fungi", "split", "plant", "animal"];

/* The root node is the one no other node points at. */
export function findRoot(nodes: KeyNode[]): string {
  const targets = new Set<string>();
  nodes.forEach((n) => {
    targets.add(n.a_target);
    targets.add(n.b_target);
  });
  const root = nodes.find((n) => !targets.has(n.id));
  return root ? root.id : nodes[0]?.id ?? "q1";
}

/* Validate that every branch resolves to an organism and flag problems. */
export interface GraphIssue {
  kind: "orphan" | "dead-end" | "bad-target" | "cycle";
  nodeId: string;
  detail: string;
}

export function validateGraph(nodes: KeyNode[], organisms: Organism[]): GraphIssue[] {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const orgIds = new Set(organisms.map((o) => o.id));
  const issues: GraphIssue[] = [];
  const isValidTarget = (t: string) => nodeMap.has(t) || orgIds.has(t);

  for (const n of nodes) {
    for (const [side, target] of [
      ["a", n.a_target],
      ["b", n.b_target],
    ] as const) {
      if (!target) {
        issues.push({ kind: "dead-end", nodeId: n.id, detail: `Choice ${side} has no target.` });
      } else if (!isValidTarget(target)) {
        issues.push({
          kind: "bad-target",
          nodeId: n.id,
          detail: `Choice ${side} points at "${target}", which is neither a node nor an organism.`,
        });
      }
    }
  }

  // Reachability from the root.
  const root = findRoot(nodes);
  const seen = new Set<string>();
  const stack = [root];
  let guard = 0;
  while (stack.length && guard < 10000) {
    guard += 1;
    const id = stack.pop()!;
    if (seen.has(id)) continue;
    seen.add(id);
    const node = nodeMap.get(id);
    if (node) {
      if (node.a_target) stack.push(node.a_target);
      if (node.b_target) stack.push(node.b_target);
    }
  }
  for (const n of nodes) {
    if (!seen.has(n.id)) {
      issues.push({ kind: "orphan", nodeId: n.id, detail: "Not reachable from the root couplet." });
    }
  }

  return issues;
}
