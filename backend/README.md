# CivicLens API

Express backend for CivicLens. Deployable two ways:

## Option A — Vercel (serverless)

This directory is set up to deploy as its own Vercel project:

- `api/index.js` exports the Express app; Vercel calls it as a serverless
  function on every request (via the rewrite in `vercel.json`).
- `server.js` (with `app.listen()`) is **not** used on Vercel — it's only
  for local dev and Option B below.

**Setup:**
1. Create a new Vercel project from this repo.
2. Project Settings → **Root Directory** → `backend`.
3. Add environment variables (Settings → Environment Variables):
   - `FRONTEND_URL` — your deployed frontend's URL (used for CORS).
   - `NODE_ENV` — `production`.
4. Deploy. No build command needed — it's plain ESM, no compile step.

**Caveat:** Vercel's filesystem is read-only except `/tmp`, which is wiped
between invocations. If/when file-upload routes are added with `multer`,
use `multer.memoryStorage()` and push files to S3/Cloudinary/etc. rather
than `diskStorage()`.

## Option B — Render / Railway (persistent server)

Works out of the box since `app.listen()` runs as a normal long-lived process:

1. New Web Service → connect repo → **Root Directory** → `backend`.
2. Build command: `npm install`. Start command: `npm start`.
3. Set the same env vars as above, plus `PORT` if the platform requires it
   (Render/Railway usually inject this automatically).

This option supports real disk storage for file uploads without extra work.

## Env vars

| Variable       | Default                  | Used for                        |
|----------------|---------------------------|----------------------------------|
| `PORT`         | `5000`                    | Local/Option B port              |
| `FRONTEND_URL` | `http://localhost:3000`  | CORS allowed origin              |
| `NODE_ENV`     | `development`             | Logging format, error verbosity  |
