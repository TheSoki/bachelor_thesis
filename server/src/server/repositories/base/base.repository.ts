import type { Db } from "@/db/connection";
import type { Logger } from "@/server/logger";

export interface BaseRepositoryDependencies {
    db: Db;
    logger: Logger;
}

export abstract class BaseRepository {
    readonly db: Db;
    readonly logger: Logger;

    constructor(dependencies: BaseRepositoryDependencies) {
        this.db = dependencies.db;
        this.logger = dependencies.logger;
    }
}
