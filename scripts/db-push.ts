import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { getPool } from '../lib/db';

async function main() {
  const sql = readFileSync(resolve(__dirname, 'schema.sql'), 'utf8');
  const pool = getPool();
  await pool.query(sql);
  console.log('Database schema applied');
  await pool.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
