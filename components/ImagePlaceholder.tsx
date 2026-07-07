import type { Species } from "@/lib/keyData";

/*
  Labelled placeholder box. To use a real photo later, drop the file into
  /public and replace the <div> below with:
    <img src={`/${species.image}`} alt={alt} className="h-full w-full object-cover" />
*/
export default function ImagePlaceholder({
  species,
  className = "",
}: {
  species: Species;
  className?: string;
}) {
  const alt = `Photograph of ${species.common} (${species.binomial})`;
  return (
    <>
      {/* IMAGE: replace with species.image (e.g. amanita.jpg) */}
      <div
        role="img"
        aria-label={alt}
        className={`flex flex-col items-center justify-center gap-1 rounded-md border border-dashed border-copper-deep/50 bg-[repeating-linear-gradient(45deg,#efe7d3_0_12px,#e6dcc2_12px_24px)] p-4 text-center text-copper-deep ${className}`}
      >
        <span aria-hidden className="text-2xl">
          🖼️
        </span>
        <span className="font-display text-sm font-semibold text-bodyink">
          {species.common}
        </span>
        <span className="text-[0.7rem] opacity-80">
          Image placeholder — add <b>{species.image}</b>
        </span>
      </div>
    </>
  );
}
