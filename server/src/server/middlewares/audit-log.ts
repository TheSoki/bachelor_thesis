import { middleware } from "../trpc";
import { createAuditLog } from "../utils/createAuditLog";

export const auditLogMiddleware = middleware(async (opts) => {
    const { ctx, path, next } = opts;
    const result = await next();

    const user = ctx.session?.user;
    let ipAddress = ctx.req.headers["x-forwarded-for"];

    if (Array.isArray(ipAddress)) {
        ipAddress = ipAddress[0];
    }

    await createAuditLog(ctx.container, {
        path,
        ipAddress,
        userId: user?.email ? `user:${user.email}` : null,
        error: result.ok ? null : result.error.message,
    });

    return result;
});
