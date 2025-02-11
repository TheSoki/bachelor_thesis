import { z } from "zod";

export const cronSchema = z.object({
    token: z.string(),
});
