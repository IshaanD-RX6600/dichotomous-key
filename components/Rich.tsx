import { stripHtml } from "@/lib/text";

/* Content is stored/served as plain text; this renders it as-is (and defensively
   strips any stray tags) so no inline HTML ever shows on the page. */
export default function Rich({
  html,
  className,
  as: Tag = "span",
}: {
  html: string;
  className?: string;
  as?: "span" | "p" | "div" | "li";
}) {
  return <Tag className={className}>{stripHtml(html)}</Tag>;
}
