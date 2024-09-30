import { LoggerRepository } from "../repositories/logger.repository";
import { middleware } from "../trpc";
import { prisma } from "@/server/database";

export const auditLogMiddleware = middleware(async (opts) => {
    const { ctx, path, next } = opts;
    const result = await next();

    const user = ctx.session?.user;
    let ipAddress = ctx.req.headers["x-forwarded-for"] || ctx.req.socket.remoteAddress;

    const logger = ctx.container.get(LoggerRepository);

    if (Array.isArray(ipAddress)) {
        ipAddress = ipAddress[0];
    }

    if (process.env.NODE_ENV === "production") {
        try {
            await prisma.auditLog.create({
                data: {
                    operation: path,
                    userIp: ipAddress,
                    userId: user?.email ? `user:${user.email}` : null,
                    error: result.ok ? null : result.error.message,
                },
            });
        } catch (e) {
            logger.error(`Failed to create audit log: ${e instanceof Error ? e.message : e}`, {
                operation: path,
                userIp: ipAddress,
                userId: user?.email ? `user:${user.email}` : null,
            });
        }
    }

    return result;
});
