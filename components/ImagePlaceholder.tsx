"use client";

import type { Organism } from "@/lib/types";
import { useLightbox } from "./Lightbox";

/* Shows the real image when a URL is set, otherwise a labelled placeholder box.
   A real image is clickable everywhere it appears on the site: clicking (or
   pressing Enter/Space) expands it in the shared Lightbox overlay. */
export default function ImagePlaceholder({
  organism,
  className = "",
}: {
  organism: Organism;
  className?: string;
}) {
  const { open } = useLightbox();
  const alt = organism.alt || `Photograph of ${organism.common} (${organism.binomial})`;

  if (organism.image) {
    const expand = () =>
      open({ src: organism.image, alt, title: organism.common, caption: organism.caption });

    return (
      <span
        role="button"
        tabIndex={0}
        aria-label={`Expand image: ${alt}`}
        title="Click to expand"
        // stopPropagation keeps clicks from also triggering an enclosing button
        // (e.g. the node-select buttons in the interactive tree).
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          expand();
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.stopPropagation();
            e.preventDefault();
            expand();
          }
        }}
        className={`group relative block w-full cursor-zoom-in overflow-hidden rounded-md ${className}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={organism.image} alt={alt} className="h-full w-full object-cover" />
        {/* Hover / focus affordance so it's clear the image can be enlarged. */}
        <span
          aria-hidden
          className="pointer-events-none absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-ink/70 text-sm text-cream opacity-0 shadow transition-opacity duration-150 group-hover:opacity-100 group-focus:opacity-100"
        >
          ⤢
        </span>
      </span>
    );
  }

  return (
    <div
      role="img"
      aria-label={alt}
      className={`flex flex-col items-center justify-center gap-1 rounded-md border border-dashed border-copper-deep/50 bg-[repeating-linear-gradient(45deg,#efe7d3_0_12px,#e6dcc2_12px_24px)] p-4 text-center text-copper-deep ${className}`}
    >
      <span aria-hidden className="text-2xl">
        🖼️
      </span>
      <span className="font-display text-sm font-semibold text-bodyink">
        {organism.common}
      </span>
      <span className="text-[0.7rem] opacity-80">Image slot (add a URL in /admin)</span>
    </div>
  );
}
