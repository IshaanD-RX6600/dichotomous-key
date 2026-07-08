/* Thin client for the guarded admin write API. Throws on any non-2xx. */
export async function adminPost(
  entity: string,
  body: Record<string, unknown>
): Promise<{ ok: true; savedAt: string; [k: string]: unknown }> {
  const res = await fetch(`/api/admin/${entity}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as any)?.error || `Request failed (${res.status})`);
  }
  return data as { ok: true; savedAt: string };
}
