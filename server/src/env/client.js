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

const clientSchema = z.object({
    NEXT_PUBLIC_API_URL: z.string().url(),
});
const clientEnv = {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
};

const _clientEnv = clientSchema.safeParse(clientEnv);

if (_clientEnv.success === false) {
    logger.error("❌ Invalid environment variables:\n", ...formatErrors(_clientEnv.error.format()));
    throw new Error("Invalid environment variables");
}

for (const key of Object.keys(_clientEnv.data)) {
    if (!key.startsWith("NEXT_PUBLIC_")) {
        logger.warn("❌ Invalid public environment variable name:", key);

        throw new Error("Invalid public environment variable name");
    }
}

module.exports.clientEnv = _clientEnv.data;
