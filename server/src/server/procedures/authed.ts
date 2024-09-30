import { TRPCError } from "@trpc/server";
import { auditLogMiddleware } from "../middlewares/audit-log";
import { LoggerRepository } from "../repositories/logger.repository";
import { procedure } from "../trpc";

export const authedProcedure = procedure
    .use(function isAuthed(opts) {
        const user = opts.ctx.session?.user;

        if (!user) {
            opts.ctx.container.get(LoggerRepository).error("Unauthorized access");

            throw new TRPCError({ code: "UNAUTHORIZED" });
        }

        return opts.next({
            ctx: {
                user,
            },
        });
    })
    .use(auditLogMiddleware);
