"use client";

import { useState } from "react";
import type { RefEntry } from "@/lib/types";
import { adminPost } from "./adminApi";
import { useToast } from "./Toast";
import { btnDanger, btnGhost, btnPrimary, cardCls, inputCls, savedLabel } from "./ui";

type Row = RefEntry & { _key: string; _isNew?: boolean };
let counter = 0;
const keyOf = () => `r-${Date.now()}-${counter++}`;
const strip = (s: string) => s.replace(/<[^>]*>/g, "").toLowerCase();

export default function ReferencesEditor({ initial }: { initial: RefEntry[] }) {
  const toast = useToast();
  const [rows, setRows] = useState<Row[]>(initial.map((r) => ({ ...r, _key: keyOf() })));
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<Record<string, string | null>>({});

  const update = (key: string, patch: Partial<Row>) =>
    setRows((rs) => rs.map((r) => (r._key === key ? { ...r, ...patch } : r)));

  const addRow = () =>
    setRows((rs) => [...rs, { _key: keyOf(), _isNew: true, id: 0, entry: "", sort: rs.length }]);

  const save = async (row: Row) => {
    setSaving((s) => ({ ...s, [row._key]: true }));
    try {
      const res = await adminPost("references", {
        op: row._isNew ? "create" : "update",
        data: { id: row.id, entry: row.entry },
      });
      update(row._key, { _isNew: false, id: (res.id as number) ?? row.id });
      setSaved((s) => ({ ...s, [row._key]: res.savedAt }));
      toast("Saved reference.");
    } catch (e: any) {
      toast(e.message, "err");
    } finally {
      setSaving((s) => ({ ...s, [row._key]: false }));
    }
  };

  const remove = async (row: Row) => {
    if (row._isNew) return setRows((rs) => rs.filter((r) => r._key !== row._key));
    if (!confirm("Delete this reference?")) return;
    try {
      await adminPost("references", { op: "delete", id: row.id });
      setRows((rs) => rs.filter((r) => r._key !== row._key));
      toast("Deleted reference.");
    } catch (e: any) {
      toast(e.message, "err");
    }
  };

  const persistOrder = async (reordered: Row[]) => {
    const ids = reordered.filter((r) => !r._isNew).map((r) => r.id);
    try {
      await adminPost("references", { op: "reorder", ids });
      toast("Reordered.");
    } catch (e: any) {
      toast(e.message, "err");
    }
  };

  const move = (index: number, dir: -1 | 1) => {
    const next = index + dir;
    if (next < 0 || next >= rows.length) return;
    const reordered = [...rows];
    [reordered[index], reordered[next]] = [reordered[next], reordered[index]];
    setRows(reordered);
    persistOrder(reordered);
  };

  const sortAZ = () => {
    const reordered = [...rows].sort((a, b) => strip(a.entry).localeCompare(strip(b.entry)));
    setRows(reordered);
    persistOrder(reordered);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-cream-dim">{rows.length} references</p>
        <div className="flex gap-2">
          <button className={btnGhost} onClick={sortAZ}>Sort A–Z</button>
          <button className={btnPrimary} onClick={addRow}>+ Add reference</button>
        </div>
      </div>

      {rows.map((row, i) => (
        <div key={row._key} className={cardCls}>
          <div className="flex gap-2">
            <textarea
              className={`${inputCls} min-h-[70px] flex-1`}
              value={row.entry}
              onChange={(e) => update(row._key, { entry: e.target.value })}
              placeholder="APA reference"
            />
            <div className="flex shrink-0 flex-col gap-1">
              <button className={btnGhost} onClick={() => move(i, -1)} aria-label="Move up">↑</button>
              <button className={btnGhost} onClick={() => move(i, 1)} aria-label="Move down">↓</button>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-2">
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
