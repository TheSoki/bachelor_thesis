import type { Logger } from "@/server/logger";

export interface BaseServiceDependencies {
    logger: Logger;
}

export abstract class BaseService {
    readonly logger: Logger;

    constructor(dependencies: BaseServiceDependencies) {
        this.logger = dependencies.logger;
    }
}
