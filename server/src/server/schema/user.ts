import { z } from "zod";

export const userSchema = z.object({
    id: z.string(),
});

export const createUserSchema = z.object({
    name: z.string().min(3).max(255),
    email: z.string().email().min(3).max(255),
    password: z.string().min(3).max(255),
});

export const updateUserSchema = z.object({
    id: z.string(),
    name: z.string().min(3).max(255),
    email: z.string().email().min(3).max(255),
    password: z.string().min(3).max(255).optional(),
});

export const registerSchema = z.object({
    email: z.string().email().min(3).max(255),
    password: z.string().min(3).max(255),
});
