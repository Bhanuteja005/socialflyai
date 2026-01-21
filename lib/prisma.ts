import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

let prisma: PrismaClient;
const connectionString = process.env.DATABASE_URL;

if (connectionString && connectionString !== 'disabled') {
  try {
    if (process.env.NODE_ENV === 'production') {
      prisma = globalForPrisma.prisma ?? new PrismaClient({
        log: ['error'],
      });
    } else {
      const pool = new Pool({ connectionString });
      const adapter = new PrismaPg(pool);
      prisma = globalForPrisma.prisma ?? new PrismaClient({
        adapter,
        log: ['error', 'warn'],
      });
    }
    console.log('✅ Database connected');
  } catch (error: any) {
    console.warn('⚠️  Database connection failed:', error.message);
    prisma = createMockPrismaClient();
  }
} else {
  console.log('ℹ️  Database is disabled. Get free database at: https://console.neon.tech/signup');
  prisma = createMockPrismaClient();
}

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

function createMockPrismaClient(): PrismaClient {
  const message = '\n🔴 Database Not Connected\n\nGet a FREE database in 2 minutes:\n1. Go to: https://console.neon.tech/signup\n2. Sign up (no credit card required)\n3. Create project "socialflyai"\n4. Copy the connection string\n5. Update DATABASE_URL in .env.local\n6. Run: npx prisma db push\n';

  const createMockMethod = () => {
    return Promise.resolve([]);
  };

  const mockClient = {
    post: {
      count: createMockMethod,
      findMany: createMockMethod,
      findUnique: () => Promise.resolve(null),
      create: createMockMethod,
      update: createMockMethod,
      delete: createMockMethod,
    },
    socialAccount: {
      findMany: createMockMethod,
      findUnique: () => Promise.resolve(null),
      findFirst: () => Promise.resolve(null),
      create: createMockMethod,
      update: createMockMethod,
      upsert: createMockMethod,
      delete: createMockMethod,
    },
    user: {
      findUnique: () => Promise.resolve(null),
      findFirst: () => Promise.resolve(null),
      create: createMockMethod,
      update: createMockMethod,
      upsert: createMockMethod,
    },
    $disconnect: () => Promise.resolve(),
  };

  // Log the message once
  console.log(message);

  return mockClient as any;
}

export { prisma };
export default prisma;
