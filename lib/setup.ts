import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { getPool } from './db';

export async function applySchema() {
  const sql = readFileSync(resolve(__dirname, '../scripts/schema.sql'), 'utf8');
  await getPool().query(sql);
}

export async function seedDatabase() {
  const pool = getPool();

  await pool.query('DELETE FROM "PostTag"');
  await pool.query('DELETE FROM "Post"');
  await pool.query('DELETE FROM "Tag"');
  await pool.query('DELETE FROM "Category"');

  return {
    categories: 0,
    tags: 0,
    posts: 0,
  };
}
