// @ts-check
const { z } = require("zod");
const { createLogger, format, transports } = require("winston");
const { formatErrors } = require("./helpers");

const isProd = process.env.NODE_ENV === "production";

const logger = createLogger({
    level: "info",
    format: format.json(),
    transports: isProd
        ? [
              new transports.File({ filename: "error.log", level: "error" }),
              new transports.File({ filename: "combined.log" }),
          ]
        : [
              new transports.Console({
                  format: format.cli(),
              }),
          ],
});

const serverSchema = z.object({
    DATABASE_URL: z.string().url(),
    BCRYPT_SALT_ROUNDS: z.number().int().positive(),
    NEXTAUTH_SECRET: z.string(),
    NEXTAUTH_URL: z.string().url(),
});

const serverEnv = {
    DATABASE_URL: process.env.DATABASE_URL,
    BCRYPT_SALT_ROUNDS: process.env.BCRYPT_SALT_ROUNDS ? parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) : undefined,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
};

const _serverEnv = serverSchema.safeParse(serverEnv);

if (_serverEnv.success === false) {
    logger.error("❌ Invalid environment variables:\n", ...formatErrors(_serverEnv.error.format()));
    throw new Error("Invalid environment variables");
}

module.exports.serverEnv = _serverEnv.data;
