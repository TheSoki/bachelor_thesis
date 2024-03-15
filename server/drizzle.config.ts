import "dotenv/config";
import type { Config } from "drizzle-kit";
import { env } from "@/env/server";

export default {
    schema: "./src/schema",
    out: "./drizzle",
    driver: "pg",
    dbCredentials: {
        connectionString: env.DATABASE_URL,
    },
} satisfies Config;
