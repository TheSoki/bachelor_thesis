import type { InnerContext } from "@/server/context";

export {};

declare global {
    var innerCtx: InnerContext | undefined;
}
