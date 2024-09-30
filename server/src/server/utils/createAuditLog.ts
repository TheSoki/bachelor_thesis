import type { ContainerInstance } from "typedi";
import { LoggerRepository } from "../repositories/logger.repository";
import { prisma } from "@/server/database";

export const createAuditLog = async (
    container: ContainerInstance,
    {
        path,
        ipAddress,
        userId,
        error,
    }: {
        path: string;
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
                    operation: path,
                    userIp: ipAddress,
                    userId,
                    error,
                },
            });
        } catch (e) {
            logger.error(`Failed to create audit log: ${e instanceof Error ? e.message : e}`, {
                operation: path,
                userIp: ipAddress,
                userId,
                error,
            });
        }
    }
};
