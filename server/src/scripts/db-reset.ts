import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";
import { serverEnv } from "@/env/server";
import * as schema from "../db/schema";
import { sql } from "drizzle-orm/sql";
import { initLogger } from "@/server/logger";

const client = new Client({
    connectionString: serverEnv.DATABASE_URL,
});

const run = async () => {
    await client.connect();

    const db = drizzle(client, {
        logger: true,
        schema,
    });

    const tablesSchema = db._.schema;
    if (!tablesSchema) throw new Error("Schema not loaded");

    const queries = Object.values(tablesSchema).map((table) => {
        return sql.raw(`DROP TABLE IF EXISTS ${table.dbName} CASCADE;`);
    });

    await db.transaction(async (trx) => {
        await Promise.all(
            queries.map(async (query) => {
                if (query) await trx.execute(query);
            }),
        );
        await trx.execute(sql.raw("DROP SCHEMA IF EXISTS drizzle CASCADE;"));
    });
};

run()
    .catch((error) => {
        const logger = initLogger();
        logger.error(error);
        process.exit(1);
    })
    .finally(() => {
        client.end();
    });
