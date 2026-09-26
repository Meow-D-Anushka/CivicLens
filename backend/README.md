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
