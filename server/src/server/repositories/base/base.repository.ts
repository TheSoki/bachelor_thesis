import type { PrismaClient } from "@/database";
import type { Logger } from "@/server/logger";

export interface BaseRepositoryDependencies {
    prisma: PrismaClient;
    logger: Logger;
}

export abstract class BaseRepository {
    readonly prisma: PrismaClient;
    readonly logger: Logger;

    constructor(dependencies: BaseRepositoryDependencies) {
        this.prisma = dependencies.prisma;
        this.logger = dependencies.logger;
    }
}
