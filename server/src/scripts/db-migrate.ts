import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { Client } from "pg";
import { serverEnv } from "@/env/server";
import * as schema from "../db/schema";
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

    await migrate(db, {
        migrationsFolder: "./drizzle",
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
