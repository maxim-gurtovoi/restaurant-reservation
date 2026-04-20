import process from 'node:process';
import { defineConfig } from 'prisma/config';

/**
 * Prisma CLI configuration.
 *
 * Replaces the deprecated `package.json#prisma` block (removed in Prisma 7).
 * Schema path defaults to `prisma/schema.prisma` and doesn't need to be set.
 *
 * When a Prisma config file is present, the CLI stops auto-loading `.env`
 * (confirmed by the "skipping environment variable loading" notice from
 * Prisma 6.19). We reinstate it here via Node's native `loadEnvFile` so that
 * `migrate`, `db seed`, `studio`, etc. still see `DATABASE_URL` locally.
 * In environments where variables are already in `process.env`
 * (CI, containers), the missing-file case is silently ignored.
 *
 * See: https://pris.ly/prisma-config
 */
try {
  process.loadEnvFile('.env');
} catch {
  // No .env file — assume env vars are provided by the runtime.
}

export default defineConfig({
  migrations: {
    seed: 'tsx prisma/seed.ts',
  },
});
