import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";
import { serverEnv } from "@/env/server";
import * as schema from "../db/schema";
import { hash } from "bcrypt";

const client = new Client({
    connectionString: serverEnv.DATABASE_URL,
});

const run = async () => {
    await client.connect();

    const db = drizzle(client, {
        logger: true,
        schema,
    });

    const email = "sokoma25@osu.cz";

    const password = await hash(email, serverEnv.BCRYPT_SALT_ROUNDS);

    await db.insert(schema.users).values({
        name: "Marek Sokol",
        email,
        password: password,
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
