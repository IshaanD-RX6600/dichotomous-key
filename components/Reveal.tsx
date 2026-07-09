import type { ReactNode } from "react";

/* Fade-and-rise on load. Implemented as a pure-CSS animation (see `.reveal` in
   globals.css) instead of a JS "animate when scrolled into view" trigger, so
   the content is ALWAYS visible even if JavaScript never runs or the trigger
   fails. The fade is a progressive enhancement, never a prerequisite for
   seeing the content. Honors prefers-reduced-motion via the stylesheet. */
export default function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <div
      className={`reveal ${className ?? ""}`.trim()}
      style={delay ? { animationDelay: `${delay}s` } : undefined}
    >
      {children}
    </div>
  );
}
