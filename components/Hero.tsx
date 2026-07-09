import type { SiteMetaData } from "@/lib/types";
import RichHtml from "./RichHtml";

export default function Hero({ meta }: { meta: SiteMetaData }) {
  return (
    <section id="home" className="scroll-mt-20">
      <div className="relative overflow-hidden border-b border-teal-line/60">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(#dce4de 1px, transparent 1px), linear-gradient(90deg, #dce4de 1px, transparent 1px)",
            backgroundSize: "34px 34px",
          }}
        />
        <div className="section-shell relative py-20 md:py-28">
          <h1 className="max-w-4xl font-display text-4xl leading-tight text-cream md:text-6xl">
            Dichotomous Key
          </h1>
          <p className="mt-4 text-lg text-copper-soft">{meta.subtitle}</p>
          <div className="mt-6 inline-flex flex-wrap items-center gap-x-3 gap-y-1 rounded-md border border-copper/40 bg-copper/10 px-4 py-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-copper-soft">
              Ontario Forest Region
            </span>
            <span className="text-sm text-cream">
              Great Lakes–St. Lawrence Forest · southern &amp; central Ontario
            </span>
          </div>
          <div className="mt-8">
            <a href="#tree" className="inline-block rounded-md bg-copper px-6 py-3 font-semibold text-ink shadow-plate transition-transform hover:-translate-y-0.5">
              Explore the key tree ↓
            </a>
          </div>
        </div>
      </div>

      <div className="section-shell grid gap-6 py-14 md:grid-cols-5">
        <div className="md:col-span-3">
          <h2 className="font-display text-2xl text-cream">{meta.introHeading}</h2>
          <hr className="divider-botanical my-4" />
          <RichHtml as="p" html={meta.introBlurb} className="on-dark leading-relaxed text-cream-dim" />
        </div>
        <div className="md:col-span-2">
          <div className="card-parchment p-6">
            <h3 className="font-display text-xl">{meta.howToHeading}</h3>
            <ol className="mt-4 space-y-3">
              {meta.howTo.map((step, i) => (
                <li key={i} className="flex gap-3 text-sm leading-relaxed">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-copper font-display text-sm font-bold text-ink">
                    {i + 1}
                  </span>
                  <RichHtml html={step} />
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
