-- CivicLens reports table.
-- Photos are stored directly in Postgres as BYTEA so the admin can pull a
-- full report (data + image) straight from the database with no separate
-- file/object storage to manage.

CREATE TABLE IF NOT EXISTS reports (
  id                        SERIAL PRIMARY KEY,
  -- Nullable (not NOT NULL) on purpose: Postgres allows multiple NULLs under
  -- a UNIQUE constraint, so the brief window between INSERT and the
  -- follow-up UPDATE that sets this from `id` never collides under
  -- concurrent requests. Every row gets a public_id by the time it's read.
  public_id                 TEXT UNIQUE,
  issue_type                TEXT NOT NULL,
  description               TEXT NOT NULL,
  location_name             TEXT NOT NULL,
  lat                       DOUBLE PRECISION,
  lng                       DOUBLE PRECISION,
  status                    TEXT NOT NULL DEFAULT 'Pending',
  ai_result                 TEXT,
  image_similarity_percent  INTEGER,
  proximity_meters          INTEGER,
  complaint_density_count   INTEGER,
  ai_explanation            TEXT,
  similar_complaint_id      TEXT,
  confirmed_action          TEXT,
  photo                     BYTEA NOT NULL,
  photo_mime_type           TEXT NOT NULL,
  -- Perceptual hash (dHash, hex-encoded) of the uploaded photo, computed
  -- server-side on submission. Used to find visually-similar nearby reports
  -- for real duplicate detection (see backend/src/services/imageHashService.js).
  photo_hash                TEXT,
  -- AI image-authenticity check (see imageAuthenticityService.js): is the
  -- photo a genuine camera photo, or does it look AI-generated/manipulated/
  -- stock/unrelated to the reported issue?
  fake_check_verdict        TEXT,
  fake_check_confidence     INTEGER,
  fake_check_reason         TEXT,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Adds the AI-analysis columns above to a `reports` table created before
-- they existed. IF NOT EXISTS makes this safe to re-run on a fresh table too.
ALTER TABLE reports ADD COLUMN IF NOT EXISTS photo_hash TEXT;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS fake_check_verdict TEXT;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS fake_check_confidence INTEGER;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS fake_check_reason TEXT;

-- Admin dashboard lists newest-first.
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports (created_at DESC);
