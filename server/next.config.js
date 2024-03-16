// @ts-check
const { serverEnv } = require("./src/env/server");
const { clientEnv } = require("./src/env/client");

/**
 * @template {import('next').NextConfig} T
 * @param {T} config - A generic parameter that flows through to the return type
 * @constraint {{import('next').NextConfig}}
 */
function getConfig(config) {
    return config;
}

/**
 * @link https://nextjs.org/docs/api-reference/next.config.js/introduction
 */
module.exports = getConfig({
    /** We run eslint as a separate task in CI */
    eslint: { ignoreDuringBuilds: true },
    /** We run typechecking as a separate task in CI */
    typescript: {
        ignoreBuildErrors: true,
    },
});
