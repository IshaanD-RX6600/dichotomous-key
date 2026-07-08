/* ===========================================================================
   One-time migration: push the updated Biology-concepts text to the LIVE
   Postgres database WITHOUT wiping any other content (unlike the admin
   "Reset to seed" button, which truncates every table).

   It updates only the four `concepts` rows, matched by heading, and keeps the
   <b>/<i> markup so the stored text stays consistent with lib/keyData.ts.

   Run once, with the production connection string in the environment:

     # PowerShell
     $env:POSTGRES_URL="<your prod POSTGRES_URL>"; node scripts/update-concepts.mjs

     # bash
     POSTGRES_URL="<your prod POSTGRES_URL>" node scripts/update-concepts.mjs

   The bodies below mirror seedConcepts in lib/keyData.ts (the source of truth).
   =========================================================================== */
import { sql } from "@vercel/postgres";

const CONCEPTS = [
  {
    heading: "Gas Exchange in Plants & Animals",
    body: "<b>Gas exchange</b> supplies cells with oxygen for <b>cellular respiration</b> and removes carbon dioxide; it always occurs by <b>diffusion</b> across a thin, moist surface. <b>Plants</b> exchange gases through <b>stomata</b> on their leaves and <b>lenticels</b> in woody stems. In a broad-leaf <b>dicot</b> like <i>Acer saccharum</i>, photosynthesis and gas exchange happen inside the leaf's <b>palisade mesophyll</b> — tightly packed cells near the upper surface that maximize light capture — and the <b>spongy mesophyll</b> below, whose loosely packed cells and air spaces let gases <b>diffuse</b> to and from the <b>stomata</b>. <b>Animals</b> use strategies matched to their bodies: <b>insects</b> like the sawyer beetle deliver air through branching <b>tracheae</b> opening at <b>spiracles</b>; <b>fish</b> such as brook trout pass water over <b>gills</b> using <b>countercurrent exchange</b>; <b>amphibians</b> like the wood frog exchange gases by <b>diffusion</b> across their moist, <b>semipermeable</b> <b>skin</b> (<b>cutaneous respiration</b>); and <b>mammals</b> like the moose use <b>ventilation</b> — the active breathing movements that move air in and out of the <b>lungs</b> — refreshing oxygen at the huge surface of the <b>alveoli</b>, which are surrounded by <b>capillaries</b> (Raven et al., 2020).",
  },
  {
    heading: "Transport in Plants & Animals",
    body: "Large, <b>multicellular</b> organisms need transport systems to move materials farther than <b>diffusion</b> can reach. In <b>vascular plants</b>, water first enters the roots by <b>osmosis</b> — moving across a <b>semipermeable</b> membrane from high to low <b>water potential</b> — before <b>xylem</b> carries it upward, pulled by the <b>cohesion–tension</b> created as water evaporates (<b>transpiration</b>), while <b>phloem</b> moves sugars from <b>source</b> to <b>sink</b> (<b>translocation</b>). This vascular transport is found in both <b>monocots</b> (e.g. <i>Trillium grandiflorum</i>) and <b>dicots</b> (e.g. <i>Acer saccharum</i>), whereas <b>non-vascular</b> <i>Sphagnum</i> stays small and relies on <b>diffusion</b> and <b>osmosis</b> directly. <b>Animals</b> use <b>circulatory systems</b>: <b>insects</b> have an <b>open circulatory system</b> where <b>hemolymph</b> bathes the organs, while <b>vertebrates</b> have a <b>closed circulatory system</b> with hearts of rising complexity — a <b>two-chambered heart</b> in fish, a <b>three-chambered heart</b> in amphibians, and a <b>four-chambered heart</b> in mammals that fully separates oxygen-rich and oxygen-poor blood (Di Giuseppe et al., 2011).",
  },
  {
    heading: "Reproductive Strategies",
    body: "The organisms of Algonquin reproduce in strikingly different ways, spanning both <b>asexual reproduction</b> and <b>sexual reproduction</b>. <b>Prokaryotes</b> and the protist <i>Amoeba</i> reproduce <b>asexually</b> by <b>binary fission</b> — one cell dividing by <b>mitosis</b> into two genetically identical cells. <b>Fungi</b>, <b>mosses</b>, and <b>ferns</b> disperse with microscopic <b>spores</b> — ferns bear theirs in clusters called <b>sori</b>. <b>Seed plants</b> protect the embryo inside a seed: <b>gymnosperms</b> such as white pine carry naked seeds on <b>cones</b> and use <b>wind pollination</b>, while <b>angiosperms</b> enclose seeds in a <b>fruit</b> from a <b>flower</b>, often using <b>pollinators</b>. Among animals, <b>sexual reproduction</b> proceeds by <b>external fertilization</b> in water in brook trout and wood frogs (which undergo <b>metamorphosis</b>), while the moose uses <b>internal fertilization</b> and bears live young — a <b>K-selected</b> strategy of few, well-cared-for offspring (Government of Canada, 2023).",
  },
];

if (!process.env.POSTGRES_URL && !process.env.POSTGRES_URL_NON_POOLING) {
  console.error("POSTGRES_URL is not set. Provide the production connection string and re-run.");
  process.exit(1);
}

let changed = 0;
for (const c of CONCEPTS) {
  const { rowCount } = await sql`UPDATE concepts SET body = ${c.body} WHERE heading = ${c.heading}`;
  console.log(`${rowCount ? "updated" : "NO MATCH for"}: ${c.heading}`);
  changed += rowCount ?? 0;
}
console.log(`\nDone. ${changed} concept row(s) updated.`);
process.exit(0);
