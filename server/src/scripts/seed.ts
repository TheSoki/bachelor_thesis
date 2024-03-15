import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Client } from 'pg';
import { env } from '@/env/server';
import * as schema from '../schema';
import { hash } from 'bcrypt';

const client = new Client({
    connectionString: env.DATABASE_URL,
});

const run = async () => {
    await client.connect();

    const db = drizzle(client, {
        logger: true,
        schema,
    });

    const password = await hash('password', env.BCRYPT_SALT_ROUNDS);

    await db
        .insert(schema.users)
        .values({
            email: 'user@example.com',
            password: password,
        })
        .returning();
};

run()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
    .finally(() => {
        client.end();
    });
