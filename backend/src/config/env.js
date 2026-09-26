import dotenv from 'dotenv';

dotenv.config();

export const env = {
  port: process.env.PORT || 5000,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  nodeEnv: process.env.NODE_ENV || 'development',
  // Aiven (or any) Postgres connection string, e.g.
  // postgres://user:pass@host:port/dbname?sslmode=require
  databaseUrl: process.env.DATABASE_URL || '',
  // Aiven's certs chain to a CA that isn't in Node's default trust store.
  // Leave this on unless you've provided PGSSLROOTCERT with Aiven's CA cert.
  dbRejectUnauthorized: process.env.PGSSL_REJECT_UNAUTHORIZED === 'true',
};
