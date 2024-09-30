import type { PrismaClient } from "@/server/database";

export {};

declare global {
    var prisma: PrismaClient | undefined;
}
