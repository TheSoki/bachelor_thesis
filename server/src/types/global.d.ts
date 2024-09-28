import type { InnerContext } from "@/server/context";
import type { Prisma } from "@/database";

export {};

declare global {
    var innerCtx: InnerContext | undefined;
    var db: Prisma | undefined;
}
