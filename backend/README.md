# CivicLens API

Express backend for CivicLens. This is a **separate deployable root** from
the frontend — the frontend (repo root) and this backend (`backend/`) are
deployed independently, and talk to each other over HTTP using a configured
base URL (see "Connecting the frontend" below).

Deploy this as a normal persistent Node web service (Render, Railway,
Fly.io, a VPS, etc.) — **not** as Vercel serverless functions. `server.js`
runs `app.listen()` and keeps a long-lived process, which is what this app
wants: a persistent `pg` connection pool and (if you ever add real disk
storage) a writable filesystem. Serverless platforms with ephemeral/read-only
filesystems and per-invocation cold starts are a bad fit for this app.

## Deploying (Render, as an example)

1. Push this repo to GitHub (frontend at repo root, this folder at `backend/`).
2. In Render: **New → Web Service** → connect the repo.
3. **Root Directory**: `backend`
4. **Build Command**: `npm install`
5. **Start Command**: `npm start`
6. **Environment variables** (Render → Environment):
   - `DATABASE_URL` — your Aiven (or other) Postgres connection string
   - `FRONTEND_URL` — the deployed frontend's origin, e.g. `https://your-app.vercel.app` (no trailing slash)
   - `NODE_ENV` — `production`
   - `PGSSL_REJECT_UNAUTHORIZED` — `false` (or `true` + `PGSSLROOTCERT` if you've uploaded Aiven's CA cert)
   - `GEMINI_API_KEY` — a free key from https://aistudio.google.com/apikey, powers the AI photo-authenticity check on submission. Reports still submit fine without it — the check just reports "not configured" instead of a real verdict.
   - `PORT` — Render sets this automatically; you don't need to set it
7. Deploy. Once it's live, run the migration once (Render → Shell tab, or a
   one-off job): `npm run migrate` — this applies `src/db/schema.sql` and
   creates the `reports` table.
8. Note the resulting service URL (e.g. `https://civiclens-api.onrender.com`)
   — the frontend needs it.

Railway works the same way: New Project → Deploy from repo → set **Root
Directory** to `backend`, same env vars, same build/start commands.

## Connecting the frontend

The frontend reads the backend's URL from `VITE_API_URL` at build time
(see `src/lib/api.ts` at the repo root). In your frontend's host (Vercel):

- Project Settings → Environment Variables → add `VITE_API_URL` = your
  backend's URL from step 8 above (no trailing slash), e.g.
  `https://civiclens-api.onrender.com`.
- Redeploy the frontend so the new env var is baked into the build.

And make sure the backend's `FRONTEND_URL` env var (step 6) matches the
frontend's real deployed origin exactly — `src/app.js` uses it as the CORS
allow-origin, so a mismatch will show up as CORS errors in the browser
console, not a server error.

## Env vars

| Variable                    | Default                  | Used for                          |
|------------------------------|---------------------------|------------------------------------|
| `PORT`                       | `5000`                    | Port the server listens on         |
| `FRONTEND_URL`                | `http://localhost:3000`  | CORS allowed origin                |
| `NODE_ENV`                    | `development`             | Logging format, error verbosity    |
| `DATABASE_URL`                 | —                          | Postgres connection string         |
| `PGSSL_REJECT_UNAUTHORIZED`    | `false`                    | Strict TLS verification for Postgres |
| `PGSSLROOTCERT`                | —                          | Path to Aiven's CA cert (only if the above is `true`) |
| `GEMINI_API_KEY`               | —                          | Google AI Studio key for the AI photo-authenticity check on submission |

## AI image analysis (duplicate & authenticity detection)

Every `POST /api/reports` submission runs two independent checks server-side, both computed from the actual uploaded photo — nothing here is trusted from the client:

- **Duplicate detection** (`src/services/imageHashService.js` + `duplicateDetectionService.js`): a perceptual hash (dHash) of the photo is computed and compared, via Hamming distance, against every other report's hash within a 150m radius. A high-similarity nearby match is classified as "Likely Duplicate"; several nearby reports with no single strong match are flagged "Possible Wider Outage"; otherwise the report stands as a "Separate Fault". This needs no API key or external service — it's pure image processing (via `sharp`) and geo-distance math.
- **Authenticity check** (`src/services/imageAuthenticityService.js`): the photo is sent to Gemini's vision model (`GEMINI_API_KEY`) along with the reported issue type/description, and asked whether it looks like a genuine camera photo or shows signs of being AI-generated, digitally manipulated, a stock image, or unrelated to the stated issue. Returned as a verdict + confidence + one-line reason, stored per-report and shown as "Image Authenticity" on the complaint details page. Without a `GEMINI_API_KEY`, this degrades to an "UNCLEAR / not configured" result rather than blocking submission.

Both write to new columns on `reports` (`photo_hash`, `fake_check_verdict`, `fake_check_confidence`, `fake_check_reason`). Run `npm run migrate` again after pulling this in — the migration uses `ADD COLUMN IF NOT EXISTS`, so it's safe to re-run against an existing database.
