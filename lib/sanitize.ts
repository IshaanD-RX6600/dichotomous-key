/*
  Minimal server-side HTML sanitizer. Content fields allow a small set of
  inline formatting tags (for bolding key terms and italic binomials); every-
  thing else (scripts, event handlers, other tags) is stripped. Admin writes
  are already behind auth, but we sanitize regardless as defence in depth.
*/
const ALLOWED = new Set(["b", "strong", "i", "em", "u", "br", "sub", "sup"]);

export function sanitizeHtml(input: unknown): string {
  if (typeof input !== "string") return "";
  let out = input;

  // Drop <script>/<style> blocks entirely (with contents).
  out = out.replace(/<\s*(script|style)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, "");

  // Walk every tag; keep only whitelisted ones, and strip all attributes.
  out = out.replace(/<\/?\s*([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g, (_m, tag: string) => {
    const name = tag.toLowerCase();
    if (!ALLOWED.has(name)) return "";
    const closing = _m.trim().startsWith("</");
    return closing ? `</${name}>` : `<${name}>`;
  });

  return out.trim();
}

export function sanitizePlain(input: unknown): string {
  if (typeof input !== "string") return "";
  return input.replace(/<[^>]*>/g, "").trim();
}
