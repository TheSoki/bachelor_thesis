// @ts-check
const { z } = require("zod");
const { formatErrors } = require("./helpers");

const serverSchema = z.object({
    DATABASE_URL: z.string().url(),
    BCRYPT_SALT_ROUNDS: z.number().int().positive(),
    NEXTAUTH_SECRET: z.string(),
    NEXTAUTH_URL: z.string().url(),
    STAG_SCHEDULE_EVENTS_API_URL: z.string().url(),
    STAG_SCHEDULE_EVENTS_API_AUTHORIZATION_HEADER_TOKEN: z.string(),
    CRON_SECRET: z.string(),
});

const serverEnv = {
    DATABASE_URL: process.env.DATABASE_URL,
    BCRYPT_SALT_ROUNDS: process.env.BCRYPT_SALT_ROUNDS ? parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) : undefined,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    STAG_SCHEDULE_EVENTS_API_URL: process.env.STAG_SCHEDULE_EVENTS_API_URL,
    STAG_SCHEDULE_EVENTS_API_AUTHORIZATION_HEADER_TOKEN:
        process.env.STAG_SCHEDULE_EVENTS_API_AUTHORIZATION_HEADER_TOKEN,
    CRON_SECRET: process.env.CRON_SECRET,
};

const _serverEnv = serverSchema.safeParse(serverEnv);

if (_serverEnv.success === false) {
    console.error("❌ Invalid environment variables:\n", ...formatErrors(_serverEnv.error.format()));
    throw new Error("Invalid environment variables");
}

module.exports.serverEnv = _serverEnv.data;
