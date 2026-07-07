"use client";

import { motion, useReducedMotion } from "framer-motion";
import { kingdoms, kingdomMeta, species } from "@/lib/keyData";
import Rich from "./Rich";
import ImagePlaceholder from "./ImagePlaceholder";
import SectionHeading from "./SectionHeading";
import Reveal from "./Reveal";

export default function SpeciesGallery() {
  const reduced = useReducedMotion();

  return (
    <section id="gallery" className="scroll-mt-20 py-16">
      <div className="section-shell">
        <Reveal>
          <SectionHeading
            eyebrow="Specimen plates"
            title="Species gallery"
            lead="All <b>18 organisms</b> grouped by kingdom. Each plate lists the <b>common name</b>, the <b>binomial name</b> (italicized), taxonomic group, key traits, an image slot with descriptive alt text, and an <b>APA image citation</b>."
          />
        </Reveal>

        {kingdoms.map((group, gi) => {
          const meta = kingdomMeta[group.key];
          return (
            <Reveal key={group.key} delay={gi * 0.05}>
              <div className="mt-12 first:mt-8">
                <div className="mb-4 flex items-center gap-3">
                  <span
                    className="inline-block h-4 w-4 rounded-sm"
                    style={{ background: meta.color }}
                  />
                  <h3 className="font-display text-2xl" style={{ color: meta.color }}>
                    {meta.name}
                  </h3>
                  <hr className="divider-botanical flex-1" />
                </div>

                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {group.members.map((id) => {
                    const s = species[id];
                    return (
                      <motion.article
                        key={id}
                        whileHover={reduced ? undefined : { y: -6, scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 300, damping: 24 }}
                        className="card-parchment overflow-hidden"
                      >
                        <div style={{ height: 5, background: meta.color }} />
                        <div className="p-4">
                          <ImagePlaceholder species={s} className="mb-2 h-36" />
                          <p className="text-[0.7rem] italic text-bodyink/60">
                            <Rich html={s.caption} />
                          </p>
                          <h4 className="mt-3 font-display text-lg leading-tight">
                            {s.common}
                          </h4>
                          <p className="italic text-copper-deep">{s.binomial}</p>
                          <p className="mt-1 inline-block rounded bg-black/5 px-2 py-0.5 text-[0.7rem] text-bodyink/70">
                            {s.group}
                          </p>
                          <ul className="mt-3 space-y-1.5">
                            {s.traits.map((t, i) => (
                              <li key={i} className="flex gap-2 text-sm leading-snug">
                                <span style={{ color: meta.color }}>•</span>
                                <Rich html={t} />
                              </li>
                            ))}
                          </ul>
                        </div>
                      </motion.article>
                    );
                  })}
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
