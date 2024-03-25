// @ts-check
const { z } = require("zod");
const { formatErrors } = require("./helpers");

const clientSchema = z.object({
    NEXT_PUBLIC_API_URL: z.string().url(),
});
const clientEnv = {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
};

const _clientEnv = clientSchema.safeParse(clientEnv);

if (_clientEnv.success === false) {
    console.error("❌ Invalid environment variables:\n", ...formatErrors(_clientEnv.error.format()));
    throw new Error("Invalid environment variables");
}

for (const key of Object.keys(_clientEnv.data)) {
    if (!key.startsWith("NEXT_PUBLIC_")) {
        console.warn("❌ Invalid public environment variable name:", key);

        throw new Error("Invalid public environment variable name");
    }
}

module.exports.clientEnv = _clientEnv.data;
