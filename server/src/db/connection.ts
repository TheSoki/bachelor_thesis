import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { serverEnv } from "@/env/server";
import * as schema from "./schema";
import type { PgTransaction } from "drizzle-orm/pg-core/session";
import type { PostgresJsQueryResultHKT } from "drizzle-orm/postgres-js/session";
import type { ExtractTablesWithRelations } from "drizzle-orm";

const pool = new Pool({
    connectionString: serverEnv.DATABASE_URL,
});

export const db =
    globalThis.db ||
    drizzle(pool, {
        logger: true,
        schema,
    });

if (process.env.NODE_ENV === "production") {
    globalThis.db = db;
}

export type Db = NodePgDatabase<typeof schema>;
export type TransactionScope = PgTransaction<
    PostgresJsQueryResultHKT,
    typeof schema,
    ExtractTablesWithRelations<typeof schema>
>;
