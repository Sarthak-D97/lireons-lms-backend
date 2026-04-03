import { PrismaClient } from '@lireons/database';
import { PrismaPg } from '@prisma/adapter-pg';
import { config as loadEnv } from 'dotenv';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

declare global {
  var __academyPrisma: PrismaClient | undefined;
}

const envCandidates = [
  resolve(process.cwd(), '.env.local'),
  resolve(process.cwd(), '.env'),
  resolve(process.cwd(), '../main/.env.local'),
  resolve(process.cwd(), '../main/.env'),
  resolve(process.cwd(), '../../apps/main/.env.local'),
  resolve(process.cwd(), '../../apps/main/.env'),
];

for (const envPath of new Set(envCandidates)) {
  if (existsSync(envPath)) {
    loadEnv({ path: envPath, override: false, quiet: true });
  }
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is required to initialize Prisma in academy-frontend');
}

const prisma =
  globalThis.__academyPrisma ??
  new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

if (process.env.NODE_ENV !== 'production') {
  globalThis.__academyPrisma = prisma;
}

export default prisma;
