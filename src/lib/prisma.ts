import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Get DATABASE_URL with fallback
const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:admin@localhost:5432/bill_generator?schema=public';

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Ensure we use normal PostgreSQL connection, not Prisma Accelerate
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl
    }
  }
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
