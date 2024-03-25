import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";
import { serverEnv } from "@/env/server";
import * as schema from "../db/schema";
import { hash } from "bcrypt";
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

    const password = await hash("default@example.com", serverEnv.BCRYPT_SALT_ROUNDS);

    await db.insert(schema.users).values({
        name: "Default",
        email: "default@example.com",
        password: password,
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
