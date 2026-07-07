/* ===========================================================================
   keyData.ts — the single source of truth
   ---------------------------------------------------------------------------
   The interactive TREE, the Full Key Table, and the Species Gallery all render
   from the data below. Edit wording here and every view updates.
   HTML is allowed in text fields (<b> to bold key terms, <i> for italics).
   =========================================================================== */

export type KingdomKey = "plantae" | "animalia" | "fungi" | "micro";
export type RegionKey = "root" | "micro" | "fungi" | "split" | "plant" | "animal";

export interface Species {
  common: string;
  binomial: string;
  kingdom: KingdomKey;
  group: string;
  diagnostic: string; // why the key lands here (HTML)
  traits: string[]; // HTML allowed
  image: string; // placeholder filename to swap later
  caption: string; // APA image citation
}

export interface Choice {
  short: string; // compact label for tree edges / buttons
  label: string; // full label with bolded key terms (HTML)
  to: string; // id of next question OR a species id
}

export interface Question {
  num: string; // "1".."16" plus "8b"
  region: RegionKey;
  short: string; // compact prompt for tree nodes
  question: string; // full question (HTML, bolded key terms)
  a: Choice;
  b: Choice;
}

/* -------------------------------------------------------------------------- */
export const rootId = "q1";

export const meta = {
  siteTitle: "A Dichotomous Key to 18 Organisms of Algonquin Provincial Park",
  subtitle: "Great Lakes–St. Lawrence Forest Region · SBI3U Biology (Ontario)",
  ecozone: "Great Lakes–St. Lawrence Forest Region · Algonquin Provincial Park, Ontario",
  introHeading: "A field key to the living things of Algonquin",
  introBlurb:
    "This is an interactive <b>dichotomous key</b> for the <b>Great Lakes–St. Lawrence Forest Region</b>, drawn from the mixed forests, lakes, and wetlands of <b>Algonquin Provincial Park</b> (Ontario Parks, 2023). A <b>dichotomous key</b> identifies organisms through a series of paired, either/or questions: at each branch you pick the description that fits, following the tree until you reach a single organism. This key covers <b>18 organisms</b> spanning every <b>kingdom</b> of life, applying the <b>taxonomy</b>, <b>gas exchange</b>, <b>transport</b>, and <b>reproduction</b> concepts studied in SBI3U (Di Giuseppe et al., 2011).",
  howToHeading: "How to use the tree",
  howTo: [
    "Start at the root node, <b>Couplet 1</b>, on the left of the tree.",
    "Read each <b>question</b> and click the choice — <b>a</b> or <b>b</b> — that matches your organism. Bolded words are the diagnostic <b>key terms</b>.",
    "The chosen branch <b>lights up in copper</b> and the breadcrumb records your path until you reach a <b>species endpoint</b>.",
    "<b>Hover</b> or <b>focus</b> any node to enlarge it and reveal more detail. On a phone, use the step-through version below the tree.",
  ],
  referencesNote:
    "References are listed alphabetically in <b>APA style</b>. <b>In-text citations</b> (author, year) appear throughout the intro and Biology Concepts sections. <i>Replace or verify these with the exact sources you used for your assignment.</i>",
  footer:
    "Interactive dichotomous key · <b>SBI3U Biology</b> · Great Lakes–St. Lawrence Forest Region, Algonquin Provincial Park.",
};

export const regionMeta: Record<RegionKey, { name: string; color: string }> = {
  root: { name: "Foundation", color: "#9a854f" },
  micro: { name: "Prokaryotes & Protists", color: "#2f8a9a" },
  fungi: { name: "Fungi", color: "#8a4a6e" },
  split: { name: "Plant vs Animal", color: "#b06a34" },
  plant: { name: "Plantae", color: "#4a8a63" },
  animal: { name: "Animalia", color: "#c07030" },
};

export const kingdomMeta: Record<KingdomKey, { name: string; color: string }> = {
  plantae: { name: "Kingdom Plantae", color: "#4a8a63" },
  animalia: { name: "Kingdom Animalia", color: "#c07030" },
  fungi: { name: "Kingdom Fungi", color: "#8a4a6e" },
  micro: { name: "Prokaryotes & Protists", color: "#2f8a9a" },
};

/* -------------------------------------------------------------------------- */
export const questions: Record<string, Question> = {
  q1: {
    num: "1", region: "root", short: "Eukaryotic cells?",
    question:
      "Are the organism's cells <b>eukaryotic</b> — do they contain a true, membrane-bound <b>nucleus</b> and organelles?",
    a: { short: "Yes — eukaryotic", label: "Yes — cells are <b>eukaryotic</b> (true nucleus present)", to: "q3" },
    b: { short: "No — prokaryotic", label: "No — cells are <b>prokaryotic</b> (DNA free in the <b>cytoplasm</b>)", to: "q2" },
  },
  q2: {
    num: "2", region: "micro", short: "Peptidoglycan wall?",
    question:
      "Does the cell wall contain <b>peptidoglycan</b>, and does the cell gain energy by <b>chemosynthesis</b> (oxidizing ammonia)?",
    a: { short: "Yes — peptidoglycan", label: "Yes — <b>peptidoglycan</b> wall; a <b>chemoautotroph</b> of the nitrogen cycle", to: "nitrosomonas" },
    b: { short: "No — a methanogen", label: "No <b>peptidoglycan</b>; an anaerobic <b>methanogen</b> that produces methane", to: "methanobrevibacter" },
  },
  q3: {
    num: "3", region: "root", short: "Unicellular?",
    question: "Is the organism <b>unicellular</b> (a single cell) rather than <b>multicellular</b>?",
    a: { short: "Yes — unicellular", label: "Yes — <b>unicellular</b>", to: "q4" },
    b: { short: "No — multicellular", label: "No — <b>multicellular</b> (many specialized cells)", to: "q6" },
  },
  q4: {
    num: "4", region: "micro", short: "Photosynthetic?",
    question:
      "Is the single cell <b>photosynthetic</b> — does it contain <b>chloroplasts</b> and make its own food (an <b>autotroph</b>)?",
    a: { short: "Yes — autotroph", label: "Yes — <b>photosynthetic</b>; swims with a <b>flagellum</b>, has a red <b>eyespot</b>", to: "euglena" },
    b: { short: "No — heterotroph", label: "No — a <b>heterotroph</b>", to: "q5" },
  },
  q5: {
    num: "5", region: "micro", short: "Feeds by pseudopodia?",
    question:
      "Does the cell feed by engulfing prey with <b>pseudopodia</b> (a <b>heterotroph</b>), rather than absorbing decay?",
    a: { short: "Yes — pseudopodia", label: "Yes — ingestive <b>heterotroph</b> moving by <b>pseudopodia</b> (<b>phagocytosis</b>)", to: "amoeba" },
    b: { short: "No — saprotroph", label: "No — a <b>saprotroph</b> that creeps as a multinucleate <b>plasmodium</b>", to: "physarum" },
  },
  q6: {
    num: "6", region: "fungi", short: "Saprotroph fungus?",
    question:
      "Is the organism a <b>saprotroph</b> with cell walls of <b>chitin</b> that feeds by <b>absorption</b> (a fungus)?",
    a: { short: "Yes — a fungus", label: "Yes — a <b>fungus</b> (<b>chitin</b> walls, <b>absorptive</b> feeding, <b>spores</b>)", to: "q7" },
    b: { short: "No — plant/animal", label: "No — a <b>plant</b> or an <b>animal</b>", to: "q9" },
  },
  q7: {
    num: "7", region: "fungi", short: "Bracket on wood?",
    question: "Does the fungus grow as a tough <b>bracket</b> (shelf) on wood, rather than a fleshy <b>cap-and-stalk</b> mushroom?",
    a: { short: "Yes — a bracket", label: "Yes — a woody/leathery <b>bracket fungus</b>", to: "q8" },
    b: { short: "No — capped/funnel", label: "No — a fleshy <b>cap</b> or <b>funnel</b> mushroom", to: "q8b" },
  },
  q8: {
    num: "8", region: "fungi", short: "Thin, banded, multi-coloured?",
    question:
      "Is the bracket thin and banded with concentric, multi-coloured zones (like a fanned tail), with <b>pores</b> beneath?",
    a: { short: "Yes — banded", label: "Yes — thin, banded, fan-shaped bracket with <b>pores</b> (a <b>polypore</b>)", to: "trametes" },
    b: { short: "No — black birch mass", label: "No — a hard, black, charcoal-like <b>sterile conk</b> on birch", to: "inonotus" },
  },
  q8b: {
    num: "8b", region: "fungi", short: "Red cap, white spots?",
    question: "Does the mushroom have a bright red <b>cap</b> dotted with white <b>warts</b>, with true <b>gills</b> beneath?",
    a: { short: "Yes — red, warty cap", label: "Yes — red cap, white <b>warts</b>, white <b>gills</b>, basal <b>volva</b>", to: "amanita" },
    b: { short: "No — funnel-shaped", label: "No — yellow, <b>funnel-shaped</b> body with blunt <b>false gills</b>", to: "cantharellus" },
  },
  q9: {
    num: "9", region: "split", short: "Photosynthetic plant?",
    question:
      "Is the organism a <b>photosynthetic</b> <b>plant</b> (makes food in <b>chloroplasts</b>; cell walls of <b>cellulose</b>)?",
    a: { short: "Yes — a plant", label: "Yes — a <b>plant</b> (<b>autotroph</b>)", to: "q10" },
    b: { short: "No — an animal", label: "No — an <b>animal</b> (ingestive <b>heterotroph</b>)", to: "q14" },
  },
  q10: {
    num: "10", region: "plant", short: "Vascular tissue?",
    question: "Does the plant have <b>vascular tissue</b> — <b>xylem</b> and <b>phloem</b> — to transport water and food?",
    a: { short: "Yes — vascular", label: "Yes — a <b>vascular</b> plant", to: "q11" },
    b: { short: "No — non-vascular", label: "No — a <b>non-vascular</b> plant that absorbs water directly; reproduces by <b>spores</b>", to: "sphagnum" },
  },
  q11: {
    num: "11", region: "plant", short: "Reproduces by seeds?",
    question: "Does the vascular plant reproduce by <b>seeds</b> rather than by <b>spores</b>?",
    a: { short: "Yes — seeds", label: "Yes — a <b>seed plant</b>", to: "q12" },
    b: { short: "No — spores", label: "No — a <b>seedless vascular</b> plant (<b>pteridophyte</b>) with <b>spores</b> in <b>sori</b>", to: "matteuccia" },
  },
  q12: {
    num: "12", region: "plant", short: "Seeds enclosed in fruit?",
    question:
      "Are the <b>seeds</b> enclosed in a <b>fruit / ovary</b> (an <b>angiosperm</b>), rather than exposed on <b>cones</b>?",
    a: { short: "Yes — enclosed", label: "Yes — a <b>flowering plant</b> (<b>angiosperm</b>); seeds enclosed in a <b>fruit</b>", to: "q13" },
    b: { short: "No — cones", label: "No — a <b>gymnosperm</b>; naked seeds on woody <b>cones</b>, needle leaves", to: "pinus" },
  },
  q13: {
    num: "13", region: "plant", short: "Parallel leaf veins?",
    question: "Does the flowering plant have <b>parallel leaf veins</b> and flower parts in threes (a <b>monocot</b>)?",
    a: { short: "Yes — monocot", label: "Yes — a <b>monocot</b>: <b>parallel venation</b>, three-part flower", to: "trillium" },
    b: { short: "No — dicot", label: "No — a <b>dicot</b>: broad leaves with <b>net-like (reticulate) venation</b>", to: "acer" },
  },
  q14: {
    num: "14", region: "animal", short: "Tracheae + open circulation?",
    question:
      "Does the animal breathe through <b>spiracles</b> and <b>tracheae</b> with an <b>open circulatory system</b> (an <b>arthropod / insect</b>)?",
    a: { short: "Yes — an insect", label: "Yes — an <b>insect</b>: <b>tracheal</b> breathing, <b>open circulation</b>, jointed legs", to: "monochamus" },
    b: { short: "No — a vertebrate", label: "No — a <b>vertebrate</b>", to: "q15" },
  },
  q15: {
    num: "15", region: "animal", short: "Gills, 2-chambered heart?",
    question:
      "Does the vertebrate breathe with <b>gills</b> and have a <b>two-chambered heart</b> with single-loop circulation (a fish)?",
    a: { short: "Yes — a fish", label: "Yes — a <b>fish</b>: <b>gills</b>, <b>two-chambered heart</b>, <b>external fertilization</b>", to: "salvelinus" },
    b: { short: "No — a tetrapod", label: "No — a <b>tetrapod</b>", to: "q16" },
  },
  q16: {
    num: "16", region: "animal", short: "Moist skin, 3-chambered heart?",
    question:
      "Does the animal have moist <b>skin</b> for <b>cutaneous gas exchange</b>, a <b>three-chambered heart</b>, and <b>external fertilization</b> (an <b>amphibian</b>)?",
    a: { short: "Yes — an amphibian", label: "Yes — an <b>amphibian</b>: moist skin, <b>three-chambered heart</b>, <b>external fertilization</b>, <b>metamorphosis</b>", to: "lithobates" },
    b: { short: "No — a mammal", label: "No — a <b>mammal</b>: <b>lungs</b> with <b>alveoli</b>, <b>four-chambered heart</b>, <b>internal fertilization</b>, <b>endothermic</b>", to: "alces" },
  },
};

/* Order for the Full Key Table (8b sits after 8). */
export const questionOrder: string[] = [
  "q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8", "q8b",
  "q9", "q10", "q11", "q12", "q13", "q14", "q15", "q16",
];

/* -------------------------------------------------------------------------- */
export const species: Record<string, Species> = {
  /* Prokaryotes & Protists */
  nitrosomonas: {
    common: "Nitrifying Bacterium", binomial: "Nitrosomonas europaea", kingdom: "micro",
    group: "Domain Bacteria · Pseudomonadota (Proteobacteria)",
    diagnostic: "<b>Prokaryotic</b> cell with a <b>peptidoglycan</b> wall; a <b>chemoautotroph</b> that oxidizes ammonia to nitrite, driving the soil <b>nitrogen cycle</b>.",
    traits: ["<b>Prokaryotic</b> — no membrane-bound nucleus", "Cell wall contains <b>peptidoglycan</b>", "<b>Chemoautotroph</b> (energy from ammonia)", "Reproduces by <b>binary fission</b>"],
    image: "nitrosomonas.jpg", caption: "Image citation (APA): Author. (Year). <i>Title</i>. Source. URL",
  },
  methanobrevibacter: {
    common: "Methanogen", binomial: "Methanobrevibacter smithii", kingdom: "micro",
    group: "Domain Archaea · Euryarchaeota",
    diagnostic: "A <b>prokaryotic</b> archaeon whose wall lacks <b>peptidoglycan</b>; an anaerobic <b>methanogen</b> that releases methane in the guts of herbivores such as moose.",
    traits: ["<b>Prokaryotic</b> archaeon", "Cell wall <b>lacks peptidoglycan</b>", "Strict <b>anaerobe</b>", "Produces <b>methane</b> (CH₄) as waste"],
    image: "methanobrevibacter.jpg", caption: "Image citation (APA): Author. (Year). <i>Title</i>. Source. URL",
  },
  euglena: {
    common: "Euglena", binomial: "Euglena viridis", kingdom: "micro",
    group: "Domain Eukarya · Kingdom Protista · Euglenozoa",
    diagnostic: "A <b>unicellular</b> eukaryote that is <b>photosynthetic</b> (green <b>chloroplasts</b>); swims with a <b>flagellum</b> and detects light with a red <b>eyespot</b>.",
    traits: ["<b>Unicellular</b> eukaryote (protist)", "<b>Photosynthetic</b> — has <b>chloroplasts</b>", "Moves with a <b>flagellum</b>", "Light-sensing <b>eyespot</b>"],
    image: "euglena.jpg", caption: "Image citation (APA): Author. (Year). <i>Title</i>. Source. URL",
  },
  amoeba: {
    common: "Amoeba", binomial: "Amoeba proteus", kingdom: "micro",
    group: "Domain Eukarya · Kingdom Protista · Amoebozoa",
    diagnostic: "A <b>unicellular</b>, non-photosynthetic eukaryote; a <b>heterotroph</b> that moves and engulfs prey with <b>pseudopodia</b> by <b>phagocytosis</b>.",
    traits: ["<b>Unicellular</b> eukaryote (protist)", "<b>Heterotroph</b> — engulfs food (<b>phagocytosis</b>)", "Moves using <b>pseudopodia</b>", "No fixed body shape"],
    image: "amoeba.jpg", caption: "Image citation (APA): Author. (Year). <i>Title</i>. Source. URL",
  },
  physarum: {
    common: "Slime Mould", binomial: "Physarum polycephalum", kingdom: "micro",
    group: "Domain Eukarya · Kingdom Protista · Myxogastria",
    diagnostic: "A <b>saprotrophic</b> protist (not a true fungus) that creeps across the forest floor as a bright, multinucleate <b>plasmodium</b> feeding on decay.",
    traits: ["Eukaryotic protist (<b>not</b> a true fungus)", "<b>Saprotroph</b> on decaying matter", "Forms a creeping <b>plasmodium</b>", "Reproduces by <b>spores</b>"],
    image: "physarum.jpg", caption: "Image citation (APA): Author. (Year). <i>Title</i>. Source. URL",
  },

  /* Fungi */
  trametes: {
    common: "Turkey Tail", binomial: "Trametes versicolor", kingdom: "fungi",
    group: "Kingdom Fungi · Basidiomycota · Polyporales",
    diagnostic: "A <b>multicellular</b> fungus (<b>chitin</b> walls) growing as a thin, banded <b>bracket</b> on dead wood; a <b>saprotroph</b> releasing <b>spores</b> from <b>pores</b>.",
    traits: ["<b>Multicellular</b> fungus (<b>chitin</b> walls)", "<b>Saprotroph</b> / wood-decomposer", "Banded, fan-shaped bracket", "<b>Spores</b> from pores (a <b>polypore</b>)"],
    image: "trametes.jpg", caption: "Image citation (APA): Author. (Year). <i>Title</i>. Source. URL",
  },
  inonotus: {
    common: "Chaga", binomial: "Inonotus obliquus", kingdom: "fungi",
    group: "Kingdom Fungi · Basidiomycota · Hymenochaetales",
    diagnostic: "A fungus forming a hard, black, charcoal-like <b>sterile conk</b> on living birch; a parasite/<b>saprotroph</b> with <b>chitin</b> walls.",
    traits: ["<b>Multicellular</b> fungus (<b>chitin</b> walls)", "Black, cracked <b>conk</b> on birch", "Parasite that later decays wood", "Reproduces by <b>spores</b>"],
    image: "inonotus.jpg", caption: "Image citation (APA): Author. (Year). <i>Title</i>. Source. URL",
  },
  amanita: {
    common: "Fly Agaric", binomial: "Amanita muscaria", kingdom: "fungi",
    group: "Kingdom Fungi · Basidiomycota · Agaricales",
    diagnostic: "A classic <b>cap-and-stalk</b> mushroom with a red <b>cap</b>, white <b>warts</b>, white <b>gills</b>, and a basal <b>volva</b>; a <b>mycorrhizal</b> fungus.",
    traits: ["<b>Multicellular</b> fungus (<b>chitin</b> walls)", "Red cap with white <b>warts</b>; white <b>gills</b>", "Forms <b>mycorrhizae</b> with tree roots", "Toxic (muscimol / ibotenic acid)"],
    image: "amanita.jpg", caption: "Image citation (APA): Author. (Year). <i>Title</i>. Source. URL",
  },
  cantharellus: {
    common: "Chanterelle", binomial: "Cantharellus cibarius", kingdom: "fungi",
    group: "Kingdom Fungi · Basidiomycota · Cantharellales",
    diagnostic: "A yellow, <b>funnel-shaped</b> mushroom with blunt, forking <b>false gills</b> (ridges); a <b>mycorrhizal</b> partner of forest trees.",
    traits: ["<b>Multicellular</b> fungus (<b>chitin</b> walls)", "Yellow, funnel/trumpet shape", "Blunt ridges (<b>false gills</b>)", "<b>Mycorrhizal</b> with trees"],
    image: "cantharellus.jpg", caption: "Image citation (APA): Author. (Year). <i>Title</i>. Source. URL",
  },

  /* Plantae */
  sphagnum: {
    common: "Sphagnum Moss", binomial: "Sphagnum capillifolium", kingdom: "plantae",
    group: "Kingdom Plantae · Bryophyta (mosses)",
    diagnostic: "A <b>non-vascular</b> plant (bryophyte) with no <b>xylem</b> or <b>phloem</b>; it absorbs water directly and reproduces by <b>spores</b>, forming the <b>peat</b> of Algonquin's bogs.",
    traits: ["<b>Non-vascular</b> (no <b>xylem</b>/<b>phloem</b>)", "<b>Photosynthetic</b>, multicellular", "Absorbs water directly", "Reproduces by <b>spores</b>; builds <b>peat</b>"],
    image: "sphagnum.jpg", caption: "Image citation (APA): Author. (Year). <i>Title</i>. Source. URL",
  },
  matteuccia: {
    common: "Ostrich Fern", binomial: "Matteuccia struthiopteris", kingdom: "plantae",
    group: "Kingdom Plantae · Polypodiopsida (ferns)",
    diagnostic: "A <b>seedless vascular</b> plant (<b>pteridophyte</b>) with true <b>xylem</b> and <b>phloem</b> and large <b>fronds</b>; it reproduces by <b>spores</b> in <b>sori</b>, not seeds.",
    traits: ["<b>Vascular</b> but <b>seedless</b> (<b>pteridophyte</b>)", "Large feathery <b>fronds</b>", "<b>Spores</b> in <b>sori</b> under fronds", "True <b>xylem</b> and <b>phloem</b>"],
    image: "matteuccia.jpg", caption: "Image citation (APA): Author. (Year). <i>Title</i>. Source. URL",
  },
  pinus: {
    common: "Eastern White Pine", binomial: "Pinus strobus", kingdom: "plantae",
    group: "Kingdom Plantae · Pinophyta (conifers)",
    diagnostic: "A <b>gymnosperm</b>: a <b>vascular</b> seed plant bearing \"naked\" <b>seeds</b> on woody <b>cones</b>, with needle leaves. Ontario's provincial tree.",
    traits: ["<b>Vascular</b> <b>gymnosperm</b>", "Naked <b>seeds</b> on woody <b>cones</b>", "Needle leaves in bundles of five", "<b>Wind-pollinated</b>; evergreen"],
    image: "pinus.jpg", caption: "Image citation (APA): Author. (Year). <i>Title</i>. Source. URL",
  },
  trillium: {
    common: "White Trillium", binomial: "Trillium grandiflorum", kingdom: "plantae",
    group: "Kingdom Plantae · Angiosperms · Monocot (Liliopsida)",
    diagnostic: "A <b>flowering plant</b> (<b>angiosperm</b>) whose <b>monocot</b> traits show in <b>parallel</b> leaf veins and flower parts in threes. Ontario's floral emblem.",
    traits: ["<b>Angiosperm</b> (seeds in an ovary)", "<b>Monocot</b>: <b>parallel</b> venation", "Flower parts in threes", "Spring woodland wildflower"],
    image: "trillium.jpg", caption: "Image citation (APA): Author. (Year). <i>Title</i>. Source. URL",
  },
  acer: {
    common: "Sugar Maple", binomial: "Acer saccharum", kingdom: "plantae",
    group: "Kingdom Plantae · Angiosperms · Dicot (Magnoliopsida)",
    diagnostic: "A <b>flowering plant</b> (<b>angiosperm</b>) with <b>dicot</b> traits: broad leaves with <b>net-like veins</b> and flower parts in fours/fives. Source of maple syrup.",
    traits: ["<b>Angiosperm</b> (seeds in a fruit)", "<b>Dicot</b>: <b>net-like</b> veins", "Broad lobed leaves; winged <b>samara</b>", "Deciduous hardwood"],
    image: "acer.jpg", caption: "Image citation (APA): Author. (Year). <i>Title</i>. Source. URL",
  },

  /* Animalia */
  monochamus: {
    common: "White-spotted Sawyer Beetle", binomial: "Monochamus scutellatus", kingdom: "animalia",
    group: "Kingdom Animalia · Arthropoda · Insecta (Coleoptera)",
    diagnostic: "An <b>insect</b> (arthropod): a jointed <b>exoskeleton</b> of <b>chitin</b>, breathing through <b>spiracles</b> and <b>tracheae</b>, with an <b>open circulatory system</b>.",
    traits: ["Invertebrate <b>arthropod</b> (insect)", "<b>Exoskeleton</b> of <b>chitin</b>", "Breathes via <b>spiracles</b>/<b>tracheae</b>", "<b>Open circulatory system</b>"],
    image: "monochamus.jpg", caption: "Image citation (APA): Author. (Year). <i>Title</i>. Source. URL",
  },
  salvelinus: {
    common: "Brook Trout", binomial: "Salvelinus fontinalis", kingdom: "animalia",
    group: "Kingdom Animalia · Chordata · Actinopterygii (fish)",
    diagnostic: "A <b>fish</b> (vertebrate): breathes with <b>gills</b>, has a <b>two-chambered heart</b> with single-loop circulation, and reproduces by <b>external fertilization</b> in cold streams.",
    traits: ["Vertebrate <b>fish</b>", "Breathes with <b>gills</b> (countercurrent)", "<b>Two-chambered heart</b>", "<b>External fertilization</b>"],
    image: "salvelinus.jpg", caption: "Image citation (APA): Author. (Year). <i>Title</i>. Source. URL",
  },
  lithobates: {
    common: "Wood Frog", binomial: "Lithobates sylvaticus", kingdom: "animalia",
    group: "Kingdom Animalia · Chordata · Amphibia (Anura)",
    diagnostic: "An <b>amphibian</b>: moist, scaleless <b>skin</b> for <b>cutaneous gas exchange</b>, a <b>three-chambered heart</b>, <b>external fertilization</b>, and <b>metamorphosis</b> from a tadpole.",
    traits: ["Vertebrate <b>amphibian</b>", "Moist <b>skin</b> for gas exchange", "<b>Three-chambered heart</b>", "<b>External fertilization</b>; freeze-tolerant"],
    image: "lithobates.jpg", caption: "Image citation (APA): Author. (Year). <i>Title</i>. Source. URL",
  },
  alces: {
    common: "Moose", binomial: "Alces alces", kingdom: "animalia",
    group: "Kingdom Animalia · Chordata · Mammalia (Artiodactyla)",
    diagnostic: "A <b>mammal</b>: breathes with alveolar <b>lungs</b>, has a <b>four-chambered heart</b>, uses <b>internal fertilization</b>, and is <b>endothermic</b> — the largest animal in Algonquin.",
    traits: ["Vertebrate <b>mammal</b>", "<b>Lungs</b> with <b>alveoli</b>; <b>four-chambered heart</b>", "<b>Internal fertilization</b>; live birth", "<b>Endothermic</b>; browsing herbivore"],
    image: "alces.jpg", caption: "Image citation (APA): Author. (Year). <i>Title</i>. Source. URL",
  },
};

/* Gallery grouping / order */
export const kingdoms: { key: KingdomKey; members: string[] }[] = [
  { key: "plantae", members: ["sphagnum", "matteuccia", "pinus", "trillium", "acer"] },
  { key: "animalia", members: ["monochamus", "salvelinus", "lithobates", "alces"] },
  { key: "fungi", members: ["trametes", "inonotus", "amanita", "cantharellus"] },
  { key: "micro", members: ["nitrosomonas", "methanobrevibacter", "euglena", "amoeba", "physarum"] },
];

/* -------------------------------------------------------------------------- */
export const concepts: { heading: string; body: string }[] = [
  {
    heading: "Taxonomy & Classification",
    body: "Every organism in this key is sorted using the science of <b>taxonomy</b> — the naming and classifying of life (Di Giuseppe et al., 2011). Biologists arrange life in a nested <b>hierarchy</b>: <b>Domain → Kingdom → Phylum → Class → Order → Family → Genus → Species</b>. Each species has a two-word <b>binomial name</b> written in italics, with a capitalized <b>genus</b> and a lowercase <b>species</b> epithet — e.g. <i>Acer saccharum</i>. The first split in this key separates <b>prokaryotes</b> (bacteria and archaea, with no membrane-bound <b>nucleus</b>) from <b>eukaryotes</b> (protists, fungi, plants, animals). Organisms are then sorted by whether they are <b>unicellular</b> or <b>multicellular</b>, and by how they obtain energy: <b>autotrophs</b> make their own food, <b>heterotrophs</b> ingest other organisms, and <b>saprotrophs</b> absorb nutrients from dead matter. Clues of <b>habitat</b> and <b>morphology</b> (body form) drive each step.",
  },
  {
    heading: "Gas Exchange in Plants & Animals",
    body: "<b>Gas exchange</b> supplies cells with oxygen for <b>cellular respiration</b> and removes carbon dioxide; it always occurs by <b>diffusion</b> across a thin, moist surface. <b>Plants</b> exchange gases through <b>stomata</b> on their leaves and <b>lenticels</b> in woody stems. <b>Animals</b> use strategies matched to their bodies: <b>insects</b> like the sawyer beetle deliver air through branching <b>tracheae</b> opening at <b>spiracles</b>; <b>fish</b> such as brook trout pass water over <b>gills</b> using <b>countercurrent exchange</b>; <b>amphibians</b> like the wood frog rely on <b>cutaneous respiration</b> across moist <b>skin</b>; and <b>mammals</b> like the moose draw air into <b>lungs</b>, where oxygen crosses the huge surface of the <b>alveoli</b> (Raven et al., 2020).",
  },
  {
    heading: "Transport in Plants & Animals",
    body: "Large, <b>multicellular</b> organisms need transport systems to move materials farther than <b>diffusion</b> can reach. <b>Vascular plants</b> use <b>xylem</b> to carry water upward — pulled by the <b>cohesion–tension</b> created as water evaporates (<b>transpiration</b>) — and <b>phloem</b> to move sugars from <b>source</b> to <b>sink</b> (<b>translocation</b>). <b>Non-vascular</b> plants like <i>Sphagnum</i> stay small and absorb water directly. <b>Animals</b> use <b>circulatory systems</b>: <b>insects</b> have an <b>open circulatory system</b> where <b>hemolymph</b> bathes the organs, while <b>vertebrates</b> have a <b>closed circulatory system</b> with hearts of rising complexity — a <b>two-chambered heart</b> in fish, a <b>three-chambered heart</b> in amphibians, and a <b>four-chambered heart</b> in mammals that fully separates oxygen-rich and oxygen-poor blood (Di Giuseppe et al., 2011).",
  },
  {
    heading: "Reproductive Strategies",
    body: "The organisms of Algonquin reproduce in strikingly different ways. <b>Prokaryotes</b> divide asexually by <b>binary fission</b>, and protists like <i>Amoeba</i> reproduce by <b>mitosis</b>. <b>Fungi</b>, <b>mosses</b>, and <b>ferns</b> disperse with microscopic <b>spores</b> — ferns bear theirs in clusters called <b>sori</b>. <b>Seed plants</b> protect the embryo inside a seed: <b>gymnosperms</b> such as white pine carry naked seeds on <b>cones</b> and use <b>wind pollination</b>, while <b>angiosperms</b> enclose seeds in a <b>fruit</b> from a <b>flower</b>, often using <b>pollinators</b>. Among animals, <b>external fertilization</b> in water is used by brook trout and wood frogs (which undergo <b>metamorphosis</b>), while the moose uses <b>internal fertilization</b> and bears live young — a <b>K-selected</b> strategy of few, well-cared-for offspring (Government of Canada, 2023).",
  },
];

export const references: string[] = [
  "Di Giuseppe, M., Vavitsas, A., Fraser, D., Ku, D., Lisser, B., &amp; Vucic, S. (2011). <i>Nelson biology 11</i>. Nelson Education.",
  "Government of Canada. (2023). <i>Species profiles</i>. Canadian Wildlife Service. https://www.canada.ca",
  "Government of Ontario. (n.d.). <i>Ontario's forest regions: Great Lakes–St. Lawrence forest</i>. Ministry of Natural Resources and Forestry. https://www.ontario.ca",
  "Ontario Parks. (2023). <i>Algonquin Provincial Park</i>. Ontario Parks. https://www.ontarioparks.com/park/algonquin",
  "Raven, P. H., Johnson, G. B., Mason, K. A., Losos, J. B., &amp; Duncan, T. (2020). <i>Biology</i> (12th ed.). McGraw-Hill Education.",
];

/* Helper shared by every view: is this id a species endpoint? */
export const isSpecies = (id: string): boolean => id in species;
