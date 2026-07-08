import type { Organism } from "@/lib/types";

/* Shows the real image when a URL is set, otherwise a labelled placeholder box. */
export default function ImagePlaceholder({
  organism,
  className = "",
}: {
  organism: Organism;
  className?: string;
}) {
  const alt = organism.alt || `Photograph of ${organism.common} (${organism.binomial})`;

  if (organism.image) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={organism.image}
        alt={alt}
        className={`w-full rounded-md object-cover ${className}`}
      />
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
      <span className="text-[0.7rem] opacity-80">Image slot — add a URL in /admin</span>
    </div>
  );
}
