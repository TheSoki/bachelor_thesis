// @ts-check
const { z } = require("zod");
const { formatErrors } = require("./helpers");

const serverSchema = z.object({
    DATABASE_URL: z.string().url(),
    BCRYPT_SALT_ROUNDS: z.number().int().positive(),
    NEXTAUTH_SECRET: z.string(),
    NEXTAUTH_URL: z.string().url(),
    SCHEDULE_EVENTS_API_URL: z.string().url(),
    USE_MOCKED_SCHEDULE_DATE: z.boolean(),
});

const serverEnv = {
    DATABASE_URL: process.env.DATABASE_URL,
    BCRYPT_SALT_ROUNDS: process.env.BCRYPT_SALT_ROUNDS ? parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) : undefined,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    SCHEDULE_EVENTS_API_URL: process.env.SCHEDULE_EVENTS_API_URL,
    USE_MOCKED_SCHEDULE_DATE: process.env.USE_MOCKED_SCHEDULE_DATE === "true",
};

const _serverEnv = serverSchema.safeParse(serverEnv);

if (_serverEnv.success === false) {
    console.error("❌ Invalid environment variables:\n", ...formatErrors(_serverEnv.error.format()));
    throw new Error("Invalid environment variables");
}

module.exports.serverEnv = _serverEnv.data;
