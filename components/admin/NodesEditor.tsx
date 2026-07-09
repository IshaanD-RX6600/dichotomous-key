"use client";

import { useMemo, useState } from "react";
import type { KeyNode, Organism, RegionKey } from "@/lib/types";
import { validateGraph } from "@/lib/display";
import { adminPost } from "./adminApi";
import { useToast } from "./Toast";
import { btnDanger, btnGhost, btnPrimary, cardCls, inputCls, labelCls, savedLabel } from "./ui";

type Row = KeyNode & { _key: string; _isNew?: boolean };
const REGIONS: RegionKey[] = ["root", "micro", "fungi", "split", "plant", "animal"];

let counter = 0;
const keyOf = () => `n-${Date.now()}-${counter++}`;

export default function NodesEditor({
  initial,
  organisms,
}: {
  initial: KeyNode[];
  organisms: Organism[];
}) {
  const toast = useToast();
  const [rows, setRows] = useState<Row[]>(initial.map((n) => ({ ...n, _key: keyOf() })));
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<Record<string, string | null>>({});

  const targetOptions = useMemo(
    () => [
      { value: "", label: "(none)" },
      ...rows.map((n) => ({ value: n.id, label: `Couplet ${n.num} · ${n.short}` })),
      ...organisms.map((o) => ({ value: o.id, label: `🧬 ${o.common} (${o.binomial})` })),
    ],
    [rows, organisms]
  );

  const issues = useMemo(() => validateGraph(rows as KeyNode[], organisms), [rows, organisms]);

  const update = (key: string, patch: Partial<Row>) =>
    setRows((rs) => rs.map((r) => (r._key === key ? { ...r, ...patch } : r)));

  const addRow = () =>
    setRows((rs) => [
      ...rs,
      {
        _key: keyOf(), _isNew: true, id: "", num: String(rs.length + 1), region: "root",
        question: "", short: "", a_label: "", a_short: "", a_target: "",
        b_label: "", b_short: "", b_target: "", sort: rs.length + 100,
      },
    ]);

  const save = async (row: Row) => {
    setSaving((s) => ({ ...s, [row._key]: true }));
    try {
      const res = await adminPost("nodes", {
        op: row._isNew ? "create" : "update",
        data: {
          id: row.id, num: row.num, region: row.region, question: row.question, short: row.short,
          a_label: row.a_label, a_short: row.a_short, a_target: row.a_target,
          b_label: row.b_label, b_short: row.b_short, b_target: row.b_target, sort: row.sort,
        },
      });
      update(row._key, { _isNew: false, id: (res.id as string) ?? row.id });
      setSaved((s) => ({ ...s, [row._key]: res.savedAt }));
      const warnings = (res.warnings as string[]) ?? [];
      toast(warnings.length ? `Saved, but ${warnings.length} tree warning(s).` : `Saved Couplet ${row.num}.`, warnings.length ? "err" : "ok");
    } catch (e: any) {
      toast(e.message, "err");
    } finally {
      setSaving((s) => ({ ...s, [row._key]: false }));
    }
  };

  const remove = async (row: Row) => {
    if (row._isNew) {
      setRows((rs) => rs.filter((r) => r._key !== row._key));
      return;
    }
    if (!confirm(`Delete Couplet ${row.num}?`)) return;
    try {
      await adminPost("nodes", { op: "delete", id: row.id });
      setRows((rs) => rs.filter((r) => r._key !== row._key));
      toast(`Deleted Couplet ${row.num}.`);
    } catch (e: any) {
      toast(e.message, "err");
    }
  };

  return (
    <div className="space-y-4">
      {/* Live validation panel */}
      <div className={`${cardCls} ${issues.length ? "border-red-400/50" : "border-copper/40"}`}>
        <h4 className="font-display text-lg text-cream">Tree validation</h4>
        {issues.length === 0 ? (
          <p className="mt-1 text-sm text-cream-dim">✓ Every branch resolves to a species and all couplets are reachable.</p>
        ) : (
          <ul className="mt-2 space-y-1 text-sm text-red-200">
            {issues.map((i, idx) => (
              <li key={idx}>⚠ <b>{i.kind}</b>: {i.detail}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-cream-dim">{rows.length} couplets</p>
        <button className={btnPrimary} onClick={addRow}>+ Add couplet</button>
      </div>

      {rows.map((row) => (
        <div key={row._key} className={cardCls}>
          <div className="flex items-center justify-between">
            <h4 className="font-display text-lg text-cream">
              Couplet {row.num} {row._isNew && <span className="text-xs text-copper-soft">(unsaved)</span>}
            </h4>
            <span className="text-xs text-cream-dim">{savedLabel(saved[row._key] ?? null)}</span>
          </div>

          <div className="mt-3 grid gap-3 md:grid-cols-3">
            <div>
              <label className={labelCls}>Node id</label>
              <input className={inputCls} value={row.id} disabled={!row._isNew} onChange={(e) => update(row._key, { id: e.target.value })} placeholder="e.g. q17" />
            </div>
            <div>
              <label className={labelCls}>Number (label)</label>
              <input className={inputCls} value={row.num} onChange={(e) => update(row._key, { num: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>Region (colour)</label>
              <select className={inputCls} value={row.region} onChange={(e) => update(row._key, { region: e.target.value as RegionKey })}>
                {REGIONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-3 grid gap-3">
            <div>
              <label className={labelCls}>Short prompt (tree node)</label>
              <input className={inputCls} value={row.short} onChange={(e) => update(row._key, { short: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>Full question</label>
              <textarea className={`${inputCls} min-h-[64px]`} value={row.question} onChange={(e) => update(row._key, { question: e.target.value })} />
            </div>
          </div>

          {(["a", "b"] as const).map((side) => (
            <div key={side} className="mt-3 rounded-md border border-teal-line/50 p-3">
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-copper-soft">Choice {side}</p>
              <div className="grid gap-3 md:grid-cols-3">
                <div>
                  <label className={labelCls}>Short label</label>
                  <input className={inputCls} value={side === "a" ? row.a_short : row.b_short} onChange={(e) => update(row._key, side === "a" ? { a_short: e.target.value } : { b_short: e.target.value })} />
                </div>
                <div className="md:col-span-2">
                  <label className={labelCls}>Full label</label>
                  <input className={inputCls} value={side === "a" ? row.a_label : row.b_label} onChange={(e) => update(row._key, side === "a" ? { a_label: e.target.value } : { b_label: e.target.value })} />
                </div>
                <div className="md:col-span-3">
                  <label className={labelCls}>Points to</label>
                  <select
                    className={inputCls}
                    value={side === "a" ? row.a_target : row.b_target}
                    onChange={(e) => update(row._key, side === "a" ? { a_target: e.target.value } : { b_target: e.target.value })}
                  >
                    {targetOptions.map((o) => (
                      <option key={o.value || "none"} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}

          <div className="mt-4 flex gap-2">
            <button className={btnPrimary} disabled={saving[row._key]} onClick={() => save(row)}>
              {saving[row._key] ? "Saving…" : "Save"}
            </button>
            <button className={btnDanger} onClick={() => remove(row)}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
}
