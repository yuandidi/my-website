import { applySchema } from '../lib/setup';
import { getPool } from '../lib/db';

async function main() {
  await applySchema();
  console.log('Database schema applied');
  await getPool().end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
