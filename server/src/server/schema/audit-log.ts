import { z } from "zod";
import { paginationSchema } from "./general";

export const auditLogListSchema = paginationSchema;

export const auditLogDeleteSchema = z.object({
    timestamp: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
});
