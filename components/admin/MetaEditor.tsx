"use client";

import { useState } from "react";
import type { SiteMetaData } from "@/lib/types";
import { adminPost } from "./adminApi";
import { useToast } from "./Toast";
import { btnPrimary, cardCls, inputCls, labelCls, savedLabel } from "./ui";

export default function MetaEditor({ initial }: { initial: SiteMetaData }) {
  const toast = useToast();
  const [meta, setMeta] = useState<SiteMetaData>(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);

  const set = (patch: Partial<SiteMetaData>) => setMeta((m) => ({ ...m, ...patch }));

  const save = async () => {
    setSaving(true);
    try {
      const res = await adminPost("meta", { op: "update", data: meta });
      setSaved(res.savedAt);
      toast("Site details saved.");
    } catch (e: any) {
      toast(e.message, "err");
    } finally {
      setSaving(false);
    }
  };

  const text = (label: string, key: keyof SiteMetaData, area = false) => (
    <div className={area ? "md:col-span-2" : ""}>
      <label className={labelCls}>{label}</label>
      {area ? (
        <textarea className={`${inputCls} min-h-[80px]`} value={String(meta[key] ?? "")} onChange={(e) => set({ [key]: e.target.value } as Partial<SiteMetaData>)} />
      ) : (
        <input className={inputCls} value={String(meta[key] ?? "")} onChange={(e) => set({ [key]: e.target.value } as Partial<SiteMetaData>)} />
      )}
    </div>
  );

  return (
    <div className={cardCls}>
      <div className="grid gap-3 md:grid-cols-2">
        {text("Site title", "siteTitle", true)}
        {text("Subtitle", "subtitle", true)}
        {text("Ecozone name", "ecozone", true)}
        {text("Intro heading", "introHeading")}
        {text("How-to heading", "howToHeading")}
        {text("Intro blurb", "introBlurb", true)}
        {text("References note", "referencesNote", true)}
        {text("Footer", "footer", true)}
        <div className="md:col-span-2">
          <label className={labelCls}>&ldquo;How to use&rdquo; steps (one per line)</label>
          <textarea
            className={`${inputCls} min-h-[120px]`}
            value={meta.howTo.join("\n")}
            onChange={(e) => set({ howTo: e.target.value.split("\n") })}
          />
        </div>
      </div>
      <p className="mt-3 text-xs text-cream-dim">
        The <b>Intro blurb</b> and <b>How to use</b> steps appear in the Home section and keep inline
        formatting: use <code className="rounded bg-ink px-1">&lt;b&gt;…&lt;/b&gt;</code> to bold key terms and
        add in-text citations like <code className="rounded bg-ink px-1">(Author, Year)</code>. Other fields are
        plain text.
      </p>
      <div className="mt-4 flex items-center gap-3">
        <button className={btnPrimary} disabled={saving} onClick={save}>
          {saving ? "Saving…" : "Save site details"}
        </button>
        <span className="text-xs text-cream-dim">{savedLabel(saved)}</span>
      </div>
    </div>
  );
}
