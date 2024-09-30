import type { z } from "zod";
import type { auditLogListSchema } from "@/server/schema/audit-log";
import type { AuditLog } from "@/server/database";
import { Service } from "typedi";
import { AuditLogRepository } from "../repositories/audit-log.repository";
import { LoggerRepository } from "../repositories/logger.repository";

export const defaultColumns = {
    id: true,
    index: true,
    timestamp: true,
    operation: true,
    userId: true,
    userIp: true,
    error: true,
} satisfies {
    [K in keyof AuditLog]?: boolean;
};

@Service()
export class AuditLogService {
    constructor(
        private readonly logger: LoggerRepository,
        private readonly auditLogRepository: AuditLogRepository,
    ) {}

    async list({ page, limit }: z.infer<typeof auditLogListSchema>) {
        const skip = (page - 1) * limit;

        try {
            const [list, totalCount] = await this.auditLogRepository.searchList({
                take: limit,
                skip,
                select: defaultColumns,
                orderBy: {
                    timestamp: "desc",
                },
            });

            const totalPages = Math.ceil(totalCount / limit);

            return {
                list,
                totalPages: totalPages === 0 ? 1 : totalPages,
                totalCount,
            };
        } catch (e) {
            this.logger.error(`Error fetching audit logs: ${e}`);

            throw new Error("Error fetching audit logs");
        }
    }
}
