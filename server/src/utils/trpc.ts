import { httpBatchLink, loggerLink } from "@trpc/client";
import { createTRPCNext } from "@trpc/next";

import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import type { NextPageContext } from "next";
import type { AppRouter } from "@/server/routers/_app";
import { transformer } from "./transformer";

function getBaseUrl() {
    if (typeof window !== "undefined") {
        return "";
    }
    // reference for vercel.com
    if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}`;
    }

    // // reference for render.com
    if (process.env.RENDER_INTERNAL_HOSTNAME) {
        return `http://${process.env.RENDER_INTERNAL_HOSTNAME}:${process.env.PORT}`;
    }

    // assume localhost
    return `http://127.0.0.1:${process.env.PORT ?? 3000}`;
}

export interface SSRContext extends NextPageContext {
    status?: number;
}

export const trpc = createTRPCNext<AppRouter, SSRContext>({
    config({ ctx }) {
        return {
            links: [
                // adds pretty logs to your console in development and logs errors in production
                loggerLink({
                    enabled: (opts) =>
                        process.env.NODE_ENV === "development" ||
                        (opts.direction === "down" && opts.result instanceof Error),
                }),
                httpBatchLink({
                    url: `${getBaseUrl()}/api/trpc`,
                    headers() {
                        if (!ctx?.req?.headers) {
                            return {};
                        }

                        const {
                            // eslint-disable-next-line @typescript-eslint/no-unused-vars
                            connection: _connection,
                            ...headers
                        } = ctx.req.headers;
                        return headers;
                    },
                    transformer,
                }),
            ],
        };
    },
    ssr: false,
    transformer,
});

export type RouterInput = inferRouterInputs<AppRouter>;
export type RouterOutput = inferRouterOutputs<AppRouter>;
