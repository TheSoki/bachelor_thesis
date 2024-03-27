import type { InnerContext } from "@/server/context";
import type { Db } from "@/db/connection";

export {};

declare global {
    var innerCtx: InnerContext | undefined;
    var db: Db | undefined;
}
