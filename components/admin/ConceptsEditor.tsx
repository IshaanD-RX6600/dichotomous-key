"use client";

import { useState } from "react";
import type { Concept } from "@/lib/types";
import { adminPost } from "./adminApi";
import { useToast } from "./Toast";
import { btnDanger, btnGhost, btnPrimary, cardCls, inputCls, labelCls, savedLabel } from "./ui";

type Row = Concept & { _key: string; _isNew?: boolean };
let counter = 0;
const keyOf = () => `c-${Date.now()}-${counter++}`;

export default function ConceptsEditor({ initial }: { initial: Concept[] }) {
  const toast = useToast();
  const [rows, setRows] = useState<Row[]>(initial.map((c) => ({ ...c, _key: keyOf() })));
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<Record<string, string | null>>({});

  const update = (key: string, patch: Partial<Row>) =>
    setRows((rs) => rs.map((r) => (r._key === key ? { ...r, ...patch } : r)));

  const addRow = () =>
    setRows((rs) => [...rs, { _key: keyOf(), _isNew: true, id: 0, heading: "New concept", body: "", sort: rs.length }]);

  const save = async (row: Row) => {
    setSaving((s) => ({ ...s, [row._key]: true }));
    try {
      const res = await adminPost("concepts", {
        op: row._isNew ? "create" : "update",
        data: { id: row.id, heading: row.heading, body: row.body },
      });
      update(row._key, { _isNew: false, id: (res.id as number) ?? row.id });
      setSaved((s) => ({ ...s, [row._key]: res.savedAt }));
      toast(`Saved "${row.heading}".`);
    } catch (e: any) {
      toast(e.message, "err");
    } finally {
      setSaving((s) => ({ ...s, [row._key]: false }));
    }
  };

  const remove = async (row: Row) => {
    if (row._isNew) return setRows((rs) => rs.filter((r) => r._key !== row._key));
    if (!confirm(`Delete "${row.heading}"?`)) return;
    try {
      await adminPost("concepts", { op: "delete", id: row.id });
      setRows((rs) => rs.filter((r) => r._key !== row._key));
      toast("Deleted concept.");
    } catch (e: any) {
      toast(e.message, "err");
    }
  };

  const move = async (index: number, dir: -1 | 1) => {
    const next = index + dir;
    if (next < 0 || next >= rows.length) return;
    const reordered = [...rows];
    [reordered[index], reordered[next]] = [reordered[next], reordered[index]];
    setRows(reordered);
    const ids = reordered.filter((r) => !r._isNew).map((r) => r.id);
    try {
      await adminPost("concepts", { op: "reorder", ids });
      toast("Reordered.");
    } catch (e: any) {
      toast(e.message, "err");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-cream-dim">{rows.length} concept sections</p>
        <button className={btnPrimary} onClick={addRow}>+ Add concept</button>
      </div>
      <p className="text-xs text-cream-dim">
        Tip: wrap key terms in <code className="rounded bg-ink px-1">&lt;b&gt;…&lt;/b&gt;</code> to bold them and
        <code className="mx-1 rounded bg-ink px-1">&lt;i&gt;…&lt;/i&gt;</code> for italic binomials. Add in-text
        citations like <code className="rounded bg-ink px-1">(Author, Year)</code> that match the References list.
      </p>

      {rows.map((row, i) => (
        <div key={row._key} className={cardCls}>
          <div className="flex items-center justify-between gap-2">
            <input
              className={`${inputCls} font-display`}
              value={row.heading}
              onChange={(e) => update(row._key, { heading: e.target.value })}
            />
            <div className="flex shrink-0 gap-1">
              <button className={btnGhost} onClick={() => move(i, -1)} aria-label="Move up">↑</button>
              <button className={btnGhost} onClick={() => move(i, 1)} aria-label="Move down">↓</button>
            </div>
          </div>
          <div className="mt-3">
            <label className={labelCls}>Body</label>
            <textarea className={`${inputCls} min-h-[140px]`} value={row.body} onChange={(e) => update(row._key, { body: e.target.value })} />
          </div>
          <div className="mt-3 flex items-center gap-2">
            <button className={btnPrimary} disabled={saving[row._key]} onClick={() => save(row)}>
              {saving[row._key] ? "Saving…" : "Save"}
            </button>
            <button className={btnDanger} onClick={() => remove(row)}>Delete</button>
            <span className="ml-auto text-xs text-cream-dim">{savedLabel(saved[row._key] ?? null)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
