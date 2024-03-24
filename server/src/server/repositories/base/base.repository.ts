import type { Db } from "@/db/connection";

export interface BaseRepositoryDependencies {
    db: Db;
}

export abstract class BaseRepository {
    readonly db: Db;

    constructor(dependencies: BaseRepositoryDependencies) {
        this.db = dependencies.db;
    }
}
