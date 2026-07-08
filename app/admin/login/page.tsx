"use client";

import { useState } from "react";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Login failed.");
        setBusy(false);
        return;
      }
      window.location.href = "/admin";
    } catch {
      setError("Network error. Try again.");
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-5 text-cream">
      <form onSubmit={submit} className="card-parchment w-full max-w-sm p-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-copper-deep">Algonquin Key</p>
        <h1 className="mt-1 font-display text-2xl text-bodyink">Admin sign-in</h1>
        <p className="mt-1 text-sm text-bodyink/70">Enter the admin password to edit site content.</p>

        <label className="mt-5 block text-xs font-semibold uppercase tracking-wide text-bodyink/70">
          Password
        </label>
        <input
          type="password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-md border border-copper-deep/40 bg-white/70 px-3 py-2 text-bodyink focus:outline-none focus:ring-2 focus:ring-copper"
        />

        {error && <p className="mt-3 rounded bg-red-500/15 px-3 py-2 text-sm text-red-700">{error}</p>}

        <button
          type="submit"
          disabled={busy}
          className="mt-4 w-full rounded-md bg-copper px-4 py-2.5 font-semibold text-ink transition-transform hover:-translate-y-0.5 disabled:opacity-50"
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>
        <a href="/" className="mt-3 block text-center text-xs text-bodyink/60 underline">
          ← Back to the site
        </a>
      </form>
    </div>
  );
}
