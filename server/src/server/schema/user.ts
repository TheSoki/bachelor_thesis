import { z } from "zod";

export const userSchema = z.object({
    id: z.string(),
});

export const userCreateSchema = z.object({
    name: z.string().min(1).max(255),
    email: z.string().email().min(1).max(255),
    password: z.string().min(1).max(255),
});

export const userUpdateSchema = z.object({
    id: z.string(),
    name: z.string().min(1).max(255).optional(),
    email: z.string().email().min(1).max(255).optional(),
    password: z.string().min(1).max(255).optional(),
});

export const registerSchema = z.object({
    email: z.string().email().min(1).max(255),
    password: z.string().min(1).max(255),
});
