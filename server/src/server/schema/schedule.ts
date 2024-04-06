import { z } from "zod";

export const scheduleSchema = z.object({
    id: z.string(),
    token: z.string(),
    displayHeight: z.number().min(1).max(10_000),
    displayWidth: z.number().min(1).max(10_000),
});
