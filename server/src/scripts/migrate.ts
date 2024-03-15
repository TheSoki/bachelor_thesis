import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { Client } from 'pg';
import { env } from '@/env/server';
import * as schema from '../schema';

const client = new Client({
    connectionString: env.DATABASE_URL,
});

const run = async () => {
    await client.connect();

    const db = drizzle(client, {
        logger: true,
        schema,
    });

    await migrate(db, {
        migrationsFolder: './drizzle',
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
