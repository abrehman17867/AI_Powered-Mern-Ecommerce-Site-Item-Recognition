# PicShop — Next.js (App Router)

A Next.js 14 port of the original MERN stack (`backend/` Express API + `fronend/` CRA client),
restructured as a single deployable app for Vercel.

## What changed vs. the original stack

| Original | Here |
| --- | --- |
| Express server (`backend/src/server.js`) | App Router route handlers in `src/app/**/route.js` |
| Express controllers/services/models | **Reused unchanged** in `src/server/` |
| CRA client (`fronend/src`) | Client components in `src/{components,customer,Admin,State,...}` |
| `react-router-dom` v6 | `src/lib/navigation.jsx` — a compatibility shim over `next/navigation` |
| Product images on local disk (`/uploads`) | Base64 data URIs stored in MongoDB |
| `predict.py` (torch/ResNet18) + `@xenova/transformers` | Hugging Face Inference API (`HF_TOKEN`) |
| `bcrypt` (native) | `bcryptjs` (pure JS — builds on serverless) |

The API contract is unchanged: every route keeps its original path, request shape,
response body and status code. Controllers run byte-for-byte as written, via the
Express adapter in `src/lib/expressAdapter.js`, which synthesises `req`/`res`
objects around the Web `Request`.

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev                  # http://localhost:3000
```

### Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `MONGODB_URL` | yes | MongoDB Atlas connection string (include the database name) |
| `SECRET_KEY` | yes | JWT signing secret |
| `STRIPE_SECRET_KEY` | for checkout | Stripe server key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | for checkout | Stripe browser key |
| `CLIENT_URL` | production | Public origin, used for Stripe redirect URLs |
| `HF_TOKEN` | for visual search | Free Hugging Face token; without it image search returns a clear "not configured" error |

## Seeding

`scripts/seedFull.js` builds the category tree and creates one product per image
found in `../backend/src/uploads` and `../backend/uploadsImage`, embedding each
image as a base64 data URI on the product document.

```bash
npm run seed:full         # idempotent upsert
npm run seed:full:reset   # drops products + categories first
```

## Architecture notes

**Client-only rendering.** The storefront was ported from a CRA SPA whose
components read `localStorage` during render. `src/app/providers.jsx` gates the
tree behind `ClientOnly`, reproducing CRA's client-only behaviour. Converting
pages to real server components (for SSR/SEO) is a natural follow-up but would
mean changing component logic.

**Serverless connection reuse.** `src/lib/db.js` caches the Mongoose connection
on `globalThis` so warm Vercel containers don't exhaust the Atlas connection limit.

**Route groups** map the old `react-router` layouts:
`(shop)` → `CustomerLayout`, `(auth)` → `AuthPageLayout`, `(account)` → `AccountLayout`,
and `admin/layout.jsx` → the `Admin` shell.

## Deploying to Vercel

Set **Root Directory** to `nextapp`, add the environment variables above, and deploy.
MongoDB Atlas must allow inbound connections from Vercel — Vercel's serverless
functions have no static outbound IP, so the Atlas Network Access list needs
`0.0.0.0/0` (or Atlas's "Allow access from anywhere").
