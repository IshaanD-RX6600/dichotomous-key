"use client";

import { useState } from "react";
import type { SiteData } from "@/lib/types";
import { ToastProvider, useToast } from "./Toast";
import { adminPost } from "./adminApi";
import { btnDanger, btnGhost } from "./ui";
import OrganismsEditor from "./OrganismsEditor";
import NodesEditor from "./NodesEditor";
import ConceptsEditor from "./ConceptsEditor";
import ReferencesEditor from "./ReferencesEditor";
import MetaEditor from "./MetaEditor";

const TABS = [
  { id: "organisms", label: "Organisms" },
  { id: "nodes", label: "Key Tree" },
  { id: "concepts", label: "Concepts" },
  { id: "references", label: "References" },
  { id: "meta", label: "Site Details" },
] as const;

type TabId = (typeof TABS)[number]["id"];

function DashboardInner({ initial, hasDb }: { initial: SiteData; hasDb: boolean }) {
  const toast = useToast();
  const [tab, setTab] = useState<TabId>("organisms");

  const logout = async () => {
    await fetch("/api/logout", { method: "POST" });
    window.location.href = "/admin/login";
  };

  const reseed = async () => {
    if (!confirm("Reset the ENTIRE database back to the original seed data? This overwrites all edits.")) return;
    try {
      await adminPost("db", { op: "seed" });
      toast("Database reset to seed. Reloading…");
      setTimeout(() => window.location.reload(), 800);
    } catch (e: any) {
      toast(e.message, "err");
    }
  };

  return (
    <div className="min-h-screen bg-ink text-cream">
      <header className="sticky top-0 z-40 border-b border-teal-line/70 bg-ink/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-3 px-5 py-3">
          <span className="mr-auto flex items-center gap-2 font-display">
            <span className="text-copper">❧</span> Admin · Algonquin Key
          </span>
          <a href="/" target="_blank" className={btnGhost}>View site ↗</a>
          <button className={btnDanger} onClick={reseed}>Reset to seed</button>
          <button className={btnGhost} onClick={logout}>Log out</button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-8">
        {!hasDb && (
          <div className="mb-6 rounded-md border border-copper/50 bg-copper/10 p-4 text-sm">
            <b className="text-copper-soft">No database connected.</b> The public site is running on
            seed data, but saving is disabled until you add Vercel Postgres and set
            <code className="mx-1 rounded bg-ink px-1">POSTGRES_URL</code>. See the README. Once
            connected, the tables auto-seed and edits go live.
          </div>
        )}

        <h1 className="font-display text-3xl">Content editor</h1>
        <p className="mt-1 text-sm text-cream-dim">
          Every save writes to Postgres and appears on the public site on the next load.
        </p>

        <nav className="mt-6 flex flex-wrap gap-2 border-b border-teal-line/60 pb-3">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
                tab === t.id ? "bg-copper text-ink" : "bg-ink-2 text-cream-dim hover:text-cream"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>

        <div className="mt-6">
          {tab === "organisms" && <OrganismsEditor initial={initial.organisms} />}
          {tab === "nodes" && <NodesEditor initial={initial.nodes} organisms={initial.organisms} />}
          {tab === "concepts" && <ConceptsEditor initial={initial.concepts} />}
          {tab === "references" && <ReferencesEditor initial={initial.references} />}
          {tab === "meta" && <MetaEditor initial={initial.meta} />}
        </div>
      </main>
    </div>
  );
}

export default function AdminDashboard({ initial, hasDb }: { initial: SiteData; hasDb: boolean }) {
  return (
    <ToastProvider>
      <DashboardInner initial={initial} hasDb={hasDb} />
    </ToastProvider>
  );
}
