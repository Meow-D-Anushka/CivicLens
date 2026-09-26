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
  connectionString: env.databaseUrl || undefined,
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
