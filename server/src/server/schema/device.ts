import { z } from "zod";

export const deviceSchema = z.object({
    id: z.string(),
});

export const createDeviceSchema = z.object({
    buildingId: z.string().min(1).max(255),
    roomId: z.string().min(1).max(255),
});

export const updateDeviceSchema = z.object({
    id: z.string(),
    buildingId: z.string().min(1).max(255).optional(),
    roomId: z.string().min(1).max(255).optional(),
});
