import { z } from "zod";
import { paginationSchema } from "./general";

// buildingId is one or two letters
const buildingIdRegex = /^[a-zA-Z]{1,2}$/;
//roomId is three numbers
const roomIdRegex = /^[0-9]{3}$/;

const buildingId = z.string().regex(buildingIdRegex, {
    message: "Building ID must be one or two letters",
});
const roomId = z.string().regex(roomIdRegex, {
    message: "Room ID must be three numbers",
});

export const deviceSchema = z.object({
    id: z.string(),
});

export const deviceCreateSchema = z.object({
    buildingId,
    roomId,
});

export const deviceUpdateSchema = z.object({
    id: z.string(),
    buildingId,
    roomId,
});

export const deviceListSchema = paginationSchema.extend({
    search: z.string().optional(),
});
