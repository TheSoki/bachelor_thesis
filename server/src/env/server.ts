import { formatErrors } from "./helpers";
import { serverEnv, serverSchema } from "./schema";

const _serverEnv = serverSchema.safeParse(serverEnv);

if (_serverEnv.success === false) {
    console.error("❌ Invalid environment variables:\n", ...formatErrors(_serverEnv.error.format()));
    throw new Error("Invalid environment variables");
}

export const env = _serverEnv.data;
