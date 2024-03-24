import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { serverEnv } from "@/env/server";
import * as schema from "./schema";
import type { PgTransaction } from "drizzle-orm/pg-core/session";
import type { PostgresJsQueryResultHKT } from "drizzle-orm/postgres-js/session";
import type { ExtractTablesWithRelations } from "drizzle-orm";

const pool = new Pool({
    connectionString: serverEnv.DATABASE_URL,
});

export const db = drizzle(pool, {
    logger: true,
    schema,
});

export type Db = typeof db;
export type TransactionScope = PgTransaction<
    PostgresJsQueryResultHKT,
    typeof schema,
    ExtractTablesWithRelations<typeof schema>
>;
