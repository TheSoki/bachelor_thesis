import "dotenv/config";
import type { Config } from "drizzle-kit";
import { serverEnv } from "@/env/server";

export default {
    schema: "./src/db/schema",
    out: "./drizzle",
    driver: "pg",
    dbCredentials: {
        connectionString: serverEnv.DATABASE_URL,
    },
} satisfies Config;
