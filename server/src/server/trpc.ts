import { initTRPC } from "@trpc/server";
import { transformer } from "@/utils/transformer";
import type { Context } from "./context";

const t = initTRPC.context<Context>().create({
    transformer,
    errorFormatter({ shape }) {
        return shape;
    },
});

export const router = t.router;

export const middleware = t.middleware;

export const mergeRouters = t.mergeRouters;

export const createCallerFactory = t.createCallerFactory;

export const procedure = t.procedure;
