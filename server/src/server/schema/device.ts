import { z } from "zod";

export const deviceSchema = z.object({
    id: z.string(),
});

export const createDeviceSchema = z.object({
    buildingId: z.string().max(255),
    roomId: z.string().max(255),
    displayHeight: z.number().int().max(10000),
    displayWidth: z.number().int().max(10000),
});

export const updateDeviceSchema = z.object({
    id: z.string(),
    buildingId: z.string().max(255).optional(),
    roomId: z.string().max(255).optional(),
    displayHeight: z.number().int().optional(),
    displayWidth: z.number().int().optional(),
});
