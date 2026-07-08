# Algonquin Dichotomous Key

An interactive **dichotomous key** identifying 18 organisms of the Great Lakes–St. Lawrence
Forest Region (Algonquin Provincial Park), built for a Grade 11 Biology assignment (SBI3U, Ontario).

- **Centerpiece:** the key rendered as an interactive **SVG tree** — hover/focus a node to enlarge
  and reveal detail, click choices to light up a path, with a breadcrumb and reset. Mobile gets a
  step-through fallback.
- **Live, database-backed content:** every public view reads from **Vercel Postgres**, and a
  password-protected **/admin** panel edits it. Admin saves appear on the public site on the next
  load — **no redeploy needed** (public pages use `dynamic = "force-dynamic"` and writes call
  `revalidatePath`).
- If no database is attached yet, the site gracefully runs from the seed data in `lib/keyData.ts`.

## Tech stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** (field-naturalist / specimen-plate theme; Fraunces + Inter)
- **Framer Motion** (tree hover/enlarge, transitions; respects `prefers-reduced-motion`)
- **@vercel/postgres** datastore, seeded from `lib/keyData.ts`
- **jose** signed-JWT session cookie for admin auth; `middleware.ts` guards `/admin` + `/api/admin/*`

## Data model (Postgres)

Tables (auto-created + seeded on first DB access): `organisms`, `key_nodes`, `concepts`,
`references_list`, `site_meta`. `key_nodes.a_target` / `b_target` hold either another node id or an
organism id — so the tree, the Full Key Table, and the Species Gallery all derive from one source.

## Environment variables

Copy `.env.example` → `.env.local` for local dev, and set the same in Vercel.

| Variable | Required | Purpose |
| --- | --- | --- |
| `ADMIN_PASSWORD` | **Yes** (for admin) | The single admin password for `/admin`. |
| `SESSION_SECRET` | Optional | Signs the session cookie; falls back to `ADMIN_PASSWORD`. |
| `POSTGRES_URL` (+ friends) | **Yes** (for persistence) | Added automatically when you attach Vercel Postgres. |

## Run locally

```bash
npm install
# put ADMIN_PASSWORD in .env.local; run `vercel env pull` to get POSTGRES_URL
npm run dev        # http://localhost:3000
```

Without `POSTGRES_URL`, the public site works from seed data and admin saving is disabled.

## Deploy to Vercel (with the live database + admin)

1. **Deploy the app:** `vercel --prod` (or import the repo at vercel.com/new).
2. **Attach Postgres:** in the Vercel dashboard → your project → **Storage** → **Create Database**
   → **Postgres** → connect it to the project. This injects `POSTGRES_URL` automatically. The tables
   auto-create and seed on the first page load.
3. **Set the admin password:** project → **Settings → Environment Variables** →
   add `ADMIN_PASSWORD` (Production). Optionally add `SESSION_SECRET`.
4. **Redeploy** so the new env vars take effect: `vercel --prod` (or click *Redeploy*).

## Using the admin panel

Go to `/admin`, sign in with `ADMIN_PASSWORD`, and edit:

- **Organisms** — full CRUD (common/binomial/kingdom/group/diagnostic/traits/image URL/alt/APA caption).
- **Key Tree** — each couplet's question, choice labels, and **a/b targets** (dropdown to another
  node or a species). A live panel flags orphaned nodes, dead-ends, and bad targets.
- **Concepts**, **References** (with A–Z sort), and **Site Details** (title, ecozone, intro, etc.).

Each item has its own **Save** button, a success/error **toast**, and a **"last saved"** time.
**Reset to seed** restores the original content. Input is validated and sanitized server-side, all
queries are parameterized, the login route is rate-limited, and only authenticated requests can write.

## Adding photos

Paste an image **URL** into an organism's *Image URL* field in `/admin` (with alt text). Blank shows
a labelled placeholder box.
