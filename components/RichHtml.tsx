import { sanitizeHtml } from "@/lib/sanitize";

/* Renders a small, whitelisted set of inline formatting tags (bold key terms,
   italic binomials). Content is sanitized server-side to the tags allowed by
   sanitizeHtml, so it is safe to inject. Used ONLY in the Home and Concepts
   sections — the rest of the site renders plain text via <Rich>. */
export default function RichHtml({
  html,
  className,
  as: Tag = "span",
}: {
  html: string;
  className?: string;
  as?: "span" | "p" | "div" | "li";
}) {
  return (
    <Tag className={className} dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }} />
  );
}
