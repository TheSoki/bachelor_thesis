// @ts-check
const { z } = require("zod");
const { formatErrors } = require("./helpers");

const serverSchema = z.object({
    DATABASE_URL: z.string().url(),
    BCRYPT_SALT_ROUNDS: z.number().int().positive(),
});

const serverEnv = {
    DATABASE_URL: process.env.DATABASE_URL,
    BCRYPT_SALT_ROUNDS: process.env.BCRYPT_SALT_ROUNDS ? parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) : undefined,
};

const _serverEnv = serverSchema.safeParse(serverEnv);

if (_serverEnv.success === false) {
    console.error("❌ Invalid environment variables:\n", ...formatErrors(_serverEnv.error.format()));
    throw new Error("Invalid environment variables");
}

module.exports.serverEnv = _serverEnv.data;
