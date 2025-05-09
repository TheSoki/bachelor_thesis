// Source: https://github.com/vercel/turbo/blob/main/examples/with-prisma/packages/database/src/client.ts
import { PrismaClient } from"@prisma-client";

declare global {
    var prisma: PrismaClient | undefined;
}

// Prevent multiple instances of Prisma Client
export const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") global.prisma = prisma;

export * from "@prisma-client"
