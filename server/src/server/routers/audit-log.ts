import { router } from "../trpc";
import { auditLogListSchema } from "../schema/audit-log";
import { TRPCError } from "@trpc/server";
import { AuditLogService } from "../services/audit-log.service";
import { authedProcedure } from "../procedures/authed";

export const auditLogRouter = router({
    list: authedProcedure.input(auditLogListSchema).query(async ({ ctx, input }) => {
        try {
            return ctx.container.get(AuditLogService).list(input);
        } catch (e) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Error fetching audit logs",
            });
        }
    }),
});
