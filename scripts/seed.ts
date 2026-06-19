import { seedDatabase } from '../lib/setup';
import { getPool } from '../lib/db';

async function main() {
  const counts = await seedDatabase();
  console.log(
    `Seed completed: ${counts.categories} categories, ${counts.tags} tags, ${counts.posts} posts`,
  );
  await getPool().end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
