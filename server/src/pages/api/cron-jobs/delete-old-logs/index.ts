import "reflect-metadata";
import { cronSchema } from "@/server/schema/cron";
import type { NextApiRequest, NextApiResponse } from "next";
import { Container } from "typedi";
import { AuditLogService } from "@/server/services/audit-log.service";
import { LoggerRepository } from "@/server/repositories/logger.repository";
import { createAuditLog } from "@/server/utils/createAuditLog";
import { serverEnv } from "@/env/server";

export default async function handler(req: NextApiRequest, res: NextApiResponse<Buffer>) {
    let ipAddress = req.headers["x-forwarded-for"];

    if (Array.isArray(ipAddress)) {
        ipAddress = ipAddress[0];
    }

    if (req.method !== "POST") {
        createAuditLog(Container.of(), {
            path: "/api/cron-jobs/delete-old-logs",
            ipAddress,
            userId: null,
            error: "405 - Invalid Method",
        });
        res.status(405).end();
        return;
    }

    const headers = {
        token: req.headers["x-cron-secret"],
    };

    const parsedData = await cronSchema.safeParseAsync(headers);

    if (!parsedData.success) {
        createAuditLog(Container.of(), {
            path: "/api/cron-jobs/delete-old-logs",
            ipAddress,
            userId: null,
            error: "405 - Invalid Format",
        });
        res.status(400).end();
        return;
    }

    if (headers.token !== serverEnv.CRON_SECRET) {
        createAuditLog(Container.of(), {
            path: "/api/cron-jobs/delete-old-logs",
            ipAddress,
            userId: null,
            error: "403 - Invalid Token",
        });
        res.status(403).end();
        return;
    }

    const requestId = `cron:${Date.now().toString()}`;
    const container = Container.of(requestId);
    container.set(LoggerRepository, new LoggerRepository(requestId));

    const auditLogService = container.get(AuditLogService);

    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");

    const timestampThirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    await auditLogService.deleteMany({
        timestamp: timestampThirtyDaysAgo,
    });

    createAuditLog(container, {
        path: "/api/cron-jobs/delete-old-logs",
        ipAddress,
        userId: null,
        error: null,
    });

    res.status(200).end();
    return;
}
