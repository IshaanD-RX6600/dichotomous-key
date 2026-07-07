/* Renders trusted content strings that contain inline <b>/<i> markup. */
export default function Rich({
  html,
  className,
  as: Tag = "span",
}: {
  html: string;
  className?: string;
  as?: "span" | "p" | "div" | "li";
}) {
  return <Tag className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}
