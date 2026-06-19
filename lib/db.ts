import { Pool, neonConfig } from '@neondatabase/serverless';

neonConfig.fetchConnectionCache = true;

let pool: Pool | undefined;

export function getPool() {
  if (!pool) {
    const connectionString =
      process.env.POSTGRES_URL ?? process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error('POSTGRES_URL or DATABASE_URL is not configured');
    }

    pool = new Pool({ connectionString });
  }

  return pool;
}

export async function query<T>(text: string, params: unknown[] = []) {
  const result = await getPool().query(text, params);
  return result.rows as T[];
}
