import { auditLogMiddleware } from "../middlewares/audit-log";
import { procedure } from "../trpc";

export const publicProcedure = procedure.use(auditLogMiddleware);
