import { z } from "zod";

export enum UsersPageURLParams {
    PAGE = "page",
    LIMIT = "limit",
    SEARCH = "search",
}

export const usersPageURLParamsSchema = z.object({
    [UsersPageURLParams.PAGE]: z
        .string()
        .transform(Number)
        .default("1")
        .transform((value) => (value > 0 ? value : 1)),
    [UsersPageURLParams.LIMIT]: z
        .string()
        .transform(Number)
        .default("10")
        .transform((value) => (value > 0 ? value : 10)),
    [UsersPageURLParams.SEARCH]: z.string().optional().default(""),
});
