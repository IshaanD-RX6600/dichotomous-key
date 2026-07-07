# Algonquin Dichotomous Key

An interactive **dichotomous key** identifying **18 organisms** of the Great Lakes–St. Lawrence
Forest Region (Algonquin Provincial Park), built for a Grade 11 Biology assignment (SBI3U, Ontario).

The centerpiece is a **branching tree diagram** drawn with SVG connectors: click a couplet's
choices to light up a path in copper, or hover/focus any node to enlarge it and reveal detail.
A responsive step-through version is provided for phones.

## Tech stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** (custom field-naturalist / specimen-plate theme)
- **Framer Motion** (tree hover/enlarge, path transitions, scroll reveals — all respect `prefers-reduced-motion`)
- No database — every question, choice, and species lives in one typed source file: [`lib/keyData.ts`](lib/keyData.ts). The interactive tree, the Full Key Table, and the Species Gallery all render from it.

## Sections

- **Home** — title, ecozone, and how to use the key.
- **The Tree** — the interactive centerpiece (with a mobile step-through fallback).
- **Full Key Table** — the complete numbered key, colour-coded by branch of life.
- **Species Gallery** — 18 cards grouped by kingdom.
- **Biology Concepts** — Taxonomy, Gas Exchange, Transport, Reproduction (key terms bolded).
- **References** — APA, alphabetical, with in-text citations noted.

## Run locally

```bash
npm install
npm run dev      # http://localhost:3000
```

Build / preview a production bundle:

```bash
npm run build
npm start
```

## Deploy to Vercel

This is a zero-config Next.js app.

- **Dashboard:** import the repo at [vercel.com/new](https://vercel.com/new) and click **Deploy**.
- **CLI:** `npm i -g vercel` then `vercel` (and `vercel --prod` for production).

## Adding your own photos

Each species uses a labelled placeholder box. To swap in a real photo:

1. Put the image (e.g. `amanita.jpg`) in a `public/` folder.
2. In [`components/ImagePlaceholder.tsx`](components/ImagePlaceholder.tsx), replace the placeholder
   `<div>` with the `<img>` shown in the adjacent `{/* IMAGE: ... */}` comment.
3. Update the filename and the APA `caption` for that species in `lib/keyData.ts`.

## Editing the wording

All text is in `lib/keyData.ts`. Use `<b>…</b>` to bold key terms and `<i>…</i>` for italics
(e.g. binomial names). Every view updates automatically.
