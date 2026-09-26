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
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Admin dashboard lists newest-first.
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports (created_at DESC);
