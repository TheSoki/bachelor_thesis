import { z } from "zod";

export const deviceSchema = z.object({
    id: z.string(),
});

export const createDeviceSchema = z.object({
    buildingId: z.string().min(1).max(255),
    roomId: z.string().min(3).max(255),
    displayWidth: z.number().int().min(300).max(10000),
    displayHeight: z.number().int().min(200).max(10000),
});

export const updateDeviceSchema = z.object({
    id: z.string(),
    buildingId: z.string().min(1).max(255),
    roomId: z.string().min(3).max(255),
    displayWidth: z.number().int().min(300).max(10000),
    displayHeight: z.number().int().min(200).max(10000),
});
