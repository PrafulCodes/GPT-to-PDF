import { Prisma, PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const prismaOptions: Prisma.PrismaClientOptions = {
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
} as const;

function createPrismaClient() {
  return new PrismaClient(prismaOptions);
}

export const db = globalThis.prisma || createPrismaClient();

globalThis.prisma = db;

export function getPrismaErrorCode(error: unknown): string | undefined {
  if (
    error &&
    typeof error === 'object' &&
    'code' in error &&
    typeof error.code === 'string' &&
    /^P\d{4}$/.test(error.code)
  ) {
    return error.code;
  }

  return undefined;
}

export function isTransientPrismaError(error: unknown): boolean {
  const code = getPrismaErrorCode(error);
  return code === 'P2024' || code === 'P1001' || code === 'P1002' || code === 'P1017';
}

export * from '@prisma/client';
