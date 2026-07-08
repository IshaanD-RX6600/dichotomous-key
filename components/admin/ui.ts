/* Shared Tailwind class strings for the admin UI (dark theme, copper accent). */
export const inputCls =
  "w-full rounded-md border border-teal-line bg-ink px-3 py-2 text-sm text-cream placeholder:text-cream-dim/50 focus:outline-none focus:ring-2 focus:ring-copper";
export const labelCls =
  "block text-[0.7rem] font-semibold uppercase tracking-wide text-cream-dim mb-1";
export const cardCls = "rounded-lg border border-teal-line/70 bg-ink-2/60 p-4";
export const btnPrimary =
  "rounded-md bg-copper px-3 py-1.5 text-sm font-semibold text-ink transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50";
export const btnGhost =
  "rounded-md border border-teal-line bg-ink-2 px-3 py-1.5 text-sm text-cream hover:border-copper/60";
export const btnDanger =
  "rounded-md border border-red-400/40 bg-red-500/10 px-3 py-1.5 text-sm text-red-200 hover:bg-red-500/20";

export function savedLabel(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return `Saved ${d.toLocaleTimeString()}`;
}
