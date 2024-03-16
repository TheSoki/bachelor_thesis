import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";
import { env } from "@/env/server";
import * as schema from "../schema";
import { sql } from "drizzle-orm/sql";

const client = new Client({
    connectionString: env.DATABASE_URL,
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
        return sql.raw(`DELETE FROM ${table.dbName};`);
    });

    await db.transaction(async (trx) => {
        await Promise.all(
            queries.map(async (query) => {
                if (query) await trx.execute(query);
            }),
        );
    });
};

run()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
    .finally(() => {
        client.end();
    });
