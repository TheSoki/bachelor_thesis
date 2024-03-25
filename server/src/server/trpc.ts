import { TRPCError, initTRPC } from "@trpc/server";
import { transformer } from "@/utils/transformer";
import type { Context } from "./context";

const t = initTRPC.context<Context>().create({
    transformer,
    errorFormatter({ shape }) {
        return shape;
    },
});

export const router = t.router;

export const publicProcedure = t.procedure;

export const mergeRouters = t.mergeRouters;

export const createCallerFactory = t.createCallerFactory;

export const authedProcedure = t.procedure.use(function isAuthed(opts) {
    const user = opts.ctx.session?.user;

    if (!user) {
        opts.ctx.logger.error("Unauthorized access");

        throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    return opts.next({
        ctx: {
            user,
        },
    });
});
