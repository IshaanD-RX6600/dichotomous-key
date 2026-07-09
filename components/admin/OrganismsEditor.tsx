"use client";

import { useState } from "react";
import type { KingdomKey, Organism } from "@/lib/types";
import { adminPost } from "./adminApi";
import { useToast } from "./Toast";
import { btnDanger, btnGhost, btnPrimary, cardCls, inputCls, labelCls, savedLabel } from "./ui";

type Row = Organism & { _key: string; _isNew?: boolean };
const KINGDOMS: KingdomKey[] = ["plantae", "animalia", "fungi", "micro"];

let counter = 0;
const keyOf = () => `row-${Date.now()}-${counter++}`;

export default function OrganismsEditor({ initial }: { initial: Organism[] }) {
  const toast = useToast();
  const [rows, setRows] = useState<Row[]>(initial.map((o) => ({ ...o, _key: keyOf() })));
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<Record<string, string | null>>({});
  // Tracks image URLs the browser couldn't load, so the preview can flag them.
  const [imgErr, setImgErr] = useState<Record<string, boolean>>({});

  const update = (key: string, patch: Partial<Row>) =>
    setRows((rs) => rs.map((r) => (r._key === key ? { ...r, ...patch } : r)));

  const setImage = (key: string, url: string) => {
    update(key, { image: url });
    setImgErr((m) => ({ ...m, [key]: false })); // give the new URL a fresh chance to load
  };

  const addRow = () =>
    setRows((rs) => [
      {
        _key: keyOf(), _isNew: true, id: "", common: "", binomial: "", kingdom: "micro",
        grp: "", diagnostic: "", traits: [], image: "", alt: "", caption: "", sort: rs.length + 100,
      },
      ...rs,
    ]);

  const save = async (row: Row) => {
    if (!/^\S+\s+\S+/.test(row.binomial.trim())) {
      toast("Binomial must be two words (Genus species).", "err");
      return;
    }
    setSaving((s) => ({ ...s, [row._key]: true }));
    try {
      const res = await adminPost("organisms", {
        op: row._isNew ? "create" : "update",
        data: {
          id: row.id, common: row.common, binomial: row.binomial, kingdom: row.kingdom,
          grp: row.grp, diagnostic: row.diagnostic, traits: row.traits,
          image: row.image, alt: row.alt, caption: row.caption, sort: row.sort,
        },
      });
      update(row._key, { _isNew: false, id: (res.id as string) ?? row.id });
      setSaved((s) => ({ ...s, [row._key]: res.savedAt }));
      toast(`Saved ${row.common || "organism"}.`);
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
    if (!confirm(`Delete ${row.common} (${row.binomial})?`)) return;
    try {
      await adminPost("organisms", { op: "delete", id: row.id });
      setRows((rs) => rs.filter((r) => r._key !== row._key));
      toast(`Deleted ${row.common}.`);
    } catch (e: any) {
      toast(e.message, "err");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-cream-dim">{rows.length} organisms</p>
        <button className={btnPrimary} onClick={addRow}>+ Add organism</button>
      </div>

      {rows.map((row) => (
        <div key={row._key} className={cardCls}>
          <div className="flex items-center justify-between">
            <h4 className="font-display text-lg text-cream">
              {row.common || "New organism"}{" "}
              {row._isNew && <span className="text-xs text-copper-soft">(unsaved)</span>}
            </h4>
            <span className="text-xs text-cream-dim">{savedLabel(saved[row._key] ?? null)}</span>
          </div>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div>
              <label className={labelCls}>Common name</label>
              <input className={inputCls} value={row.common} onChange={(e) => update(row._key, { common: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>Binomial (Genus species)</label>
              <input className={inputCls} value={row.binomial} onChange={(e) => update(row._key, { binomial: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>Kingdom group</label>
              <select className={inputCls} value={row.kingdom} onChange={(e) => update(row._key, { kingdom: e.target.value as KingdomKey })}>
                {KINGDOMS.map((k) => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Taxonomic group (display)</label>
              <input className={inputCls} value={row.grp} onChange={(e) => update(row._key, { grp: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <label className={labelCls}>Diagnostic (why the key lands here)</label>
              <textarea className={`${inputCls} min-h-[64px]`} value={row.diagnostic} onChange={(e) => update(row._key, { diagnostic: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <label className={labelCls}>Key traits (one per line)</label>
              <textarea
                className={`${inputCls} min-h-[96px]`}
                value={row.traits.join("\n")}
                onChange={(e) => update(row._key, { traits: e.target.value.split("\n") })}
              />
            </div>
            <div className="md:col-span-2">
              <label className={labelCls}>Image URL (blank = placeholder)</label>
              <input className={inputCls} value={row.image} onChange={(e) => setImage(row._key, e.target.value)} placeholder="https://…" />
              {row.image.trim() ? (
                <div className="mt-2 flex items-start gap-3 rounded-md border border-teal-line/60 bg-ink p-2">
                  {imgErr[row._key] ? (
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded bg-red-500/10 text-center text-[0.65rem] leading-tight text-red-200">
                      Can’t load URL
                    </div>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={row.image}
                      alt={row.alt || row.common || "preview"}
                      className="h-20 w-20 shrink-0 rounded object-cover"
                      onError={() => setImgErr((m) => ({ ...m, [row._key]: true }))}
                    />
                  )}
                  <p className="text-[0.7rem] leading-relaxed text-cream-dim">
                    Live preview. This is the image visitors see, and on the site they can
                    <b className="text-copper-soft"> click it to expand</b> to full size.
                    {imgErr[row._key] && (
                      <>
                        {" "}
                        <span className="text-red-200">Check that the URL is public and points directly to an image file.</span>
                      </>
                    )}
                  </p>
                </div>
              ) : (
                <p className="mt-1 text-[0.7rem] text-cream-dim">
                  No image set, so a labelled placeholder box shows on the site.
                </p>
              )}
            </div>
            <div className="md:col-span-2">
              <label className={labelCls}>Image alt text</label>
              <input className={inputCls} value={row.alt} onChange={(e) => update(row._key, { alt: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <label className={labelCls}>APA image citation</label>
              <input className={inputCls} value={row.caption} onChange={(e) => update(row._key, { caption: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>Sort order</label>
              <input type="number" className={inputCls} value={row.sort} onChange={(e) => update(row._key, { sort: Number(e.target.value) })} />
            </div>
          </div>

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
