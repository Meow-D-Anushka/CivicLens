import { readFileSync } from 'node:fs';

import pg from 'pg';

import { env } from '../config/env.js';

const { Pool } = pg;

if (!env.databaseUrl) {
  // Don't throw here — this module can be imported by scripts/health checks
  // before env is fully configured. Every query will fail loudly instead.
  console.warn(
    '[db] DATABASE_URL is not set. Set it to your Aiven Postgres connection ' +
      'string (see backend/.env.example) before using any /api/reports route.'
  );
}

const isLocal = /localhost|127\.0\.0\.1/.test(env.databaseUrl);

// node-postgres parses any `sslmode`/`ssl*` query params out of the
// connection string and merges them into its config — and those parsed
// values win over the explicit `ssl` option below (a well-known pg
// footgun: https://github.com/brianc/node-postgres/issues/2009 and
// similar). Aiven's copy-pasted "Service URI" includes `?sslmode=require`,
// which silently overrides `rejectUnauthorized: false` and brings back
// "self-signed certificate in certificate chain" no matter what `ssl` is
// passed here. Stripping it makes the explicit `buildSslConfig()` below
// the only thing that controls TLS behavior, regardless of what's in the
// URL someone pastes into DATABASE_URL.
function stripSslModeParam(connectionString) {
  if (!connectionString) return connectionString;
  try {
    const url = new URL(connectionString);
    url.searchParams.delete('sslmode');
    return url.toString();
  } catch {
    // Not a parseable URL (e.g. empty/placeholder) — leave it as-is and
    // let pg raise its own error when the pool actually connects.
    return connectionString;
  }
}

const connectionString = stripSslModeParam(env.databaseUrl);

function buildSslConfig() {
  if (isLocal) return false;

  const ssl = { rejectUnauthorized: env.dbRejectUnauthorized };

  if (env.dbRejectUnauthorized && process.env.PGSSLROOTCERT) {
    // Full verification against Aiven's downloaded CA certificate.
    ssl.ca = readFileSync(process.env.PGSSLROOTCERT, 'utf8');
  }

  return ssl;
}

export const pool = new Pool({
  connectionString: connectionString || undefined,
  // Aiven's Postgres requires SSL. Its server cert chains to Aiven's own CA,
  // which isn't in Node's default trust store, so a strict TLS check fails
  // out of the box unless PGSSLROOTCERT points at that CA cert.
  ssl: buildSslConfig(),
  max: 5,
  idleTimeoutMillis: 30_000,
});

pool.on('error', (err) => {
  // Fired for errors on idle clients in the pool (e.g. a dropped connection).
  // Logging here keeps one bad connection from crashing the whole process.
  console.error('[db] Unexpected error on idle client', err);
});
