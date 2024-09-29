import type { PrismaClient } from "@/database";

export {};

declare global {
    var prisma: PrismaClient | undefined;
}
