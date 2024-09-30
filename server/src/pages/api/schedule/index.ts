import "reflect-metadata";
import { scheduleSchema } from "@/server/schema/schedule";
import type { NextApiRequest, NextApiResponse } from "next";
import { Container, ContainerInstance } from "typedi";
import { ScheduleService } from "@/server/services/schedule.service";
import { LoggerRepository } from "@/server/repositories/logger.repository";
import { prisma } from "@/server/database";

export default async function handler(req: NextApiRequest, res: NextApiResponse<Buffer>) {
    let ipAddress = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

    if (Array.isArray(ipAddress)) {
        ipAddress = ipAddress[0];
    }

    if (req.method !== "GET") {
        createAuditLog(Container.of(), {
            ipAddress,
            userId: req.headers["x-device-id"] ? `device:${req.headers["x-device-id"] as string}` : null,
            error: "405 - Invalid Method",
        });
        res.status(405).end();
        return;
    }

    const headers = {
        id: req.headers["x-device-id"],
        token: req.headers["x-device-secret"],
        displayHeight: Number(req.headers["x-display-height"]),
        displayWidth: Number(req.headers["x-display-width"]),
    };

    const parsedData = await scheduleSchema.safeParseAsync(headers);

    if (!parsedData.success) {
        createAuditLog(Container.of(), {
            ipAddress,
            userId: req.headers["x-device-id"] ? `device:${req.headers["x-device-id"] as string}` : null,
            error: "405 - Invalid Format",
        });
        res.status(400).end();
        return;
    }

    const requestId = `device:${parsedData.data.id}`;
    const container = Container.of(requestId);
    container.set(LoggerRepository, new LoggerRepository(requestId));

    const scheduleService = container.get(ScheduleService);

    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");

    const pngBuffer = await scheduleService.getScheduleBuffer(parsedData.data);

    if (!pngBuffer) {
        createAuditLog(container, {
            ipAddress,
            userId: req.headers["x-device-id"] ? `device:${req.headers["x-device-id"] as string}` : null,
            error: "405 - No Png Buffer Created",
        });
        res.status(400).end();
        return;
    }

    res.setHeader("Content-Type", "image/png");
    res.setHeader("Content-Length", pngBuffer.length.toString());

    createAuditLog(container, {
        ipAddress,
        userId: req.headers["x-device-id"] ? `device:${req.headers["x-device-id"] as string}` : null,
        error: "200 - Success",
    });

    res.send(pngBuffer);
}

const createAuditLog = async (
    container: ContainerInstance,
    {
        ipAddress,
        userId,
        error,
    }: {
        ipAddress: string | undefined;
        userId: string | null;
        error: string | null;
    },
) => {
    const logger = container.get(LoggerRepository);

    if (process.env.NODE_ENV === "production") {
        try {
            await prisma.auditLog.create({
                data: {
                    operation: "/api/schedule",
                    userIp: ipAddress,
                    userId,
                    error,
                },
            });
        } catch (e) {
            logger.error(`Failed to create audit log: ${e instanceof Error ? e.message : e}`, {
                operation: "/api/schedule",
                userIp: ipAddress,
                userId,
                error,
            });
        }
    }
};
