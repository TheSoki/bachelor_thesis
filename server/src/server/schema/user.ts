import { z } from "zod";

export const userSchema = z.object({
    id: z.string(),
});

export const createUserSchema = z.object({
    name: z.string().max(255),
    email: z.string().email().max(255),
    password: z.string().max(255),
});

export const updateUserSchema = z.object({
    id: z.string(),
    name: z.string().max(255).optional(),
    email: z.string().email().max(255).optional(),
    password: z.string().max(255).optional().nullable(),
});

export const registerSchema = z.object({
    email: z.string().email().max(255),
    password: z.string().max(255),
});
