import { z } from "zod";

export enum DevicesPageURLParams {
    PAGE = "page",
    LIMIT = "limit",
    SEARCH = "search",
}

export const devicesPageURLParamsSchema = z.object({
    [DevicesPageURLParams.PAGE]: z
        .string()
        .transform(Number)
        .default("1")
        .transform((value) => (value > 0 ? value : 1)),
    [DevicesPageURLParams.LIMIT]: z
        .string()
        .transform(Number)
        .default("10")
        .transform((value) => (value > 0 ? value : 10)),
    [DevicesPageURLParams.SEARCH]: z.string().optional().default(""),
});
