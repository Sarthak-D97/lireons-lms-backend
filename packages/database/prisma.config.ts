import { config as loadEnv } from 'dotenv';
import { defineConfig, env } from 'prisma/config';

// Load app-local env files so root-level .env is not required.
loadEnv({ path: '../../apps/lireons-main/.env.local' });
loadEnv({ path: '../../apps/lireons-main/.env' });

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});
