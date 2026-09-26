import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { pool } from './pool.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function migrate() {
  const sqlPath = path.join(__dirname, 'schema.sql');
  const sql = readFileSync(sqlPath, 'utf8');

  console.log('[migrate] Applying schema.sql...');
  await pool.query(sql);
  console.log('[migrate] Done. `reports` table is ready.');

  await pool.end();
}

migrate().catch((err) => {
  console.error('[migrate] Failed:', err.message);
  process.exit(1);
});
