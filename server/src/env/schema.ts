import { z } from "zod";

export const clientSchema = z.object({});

export const serverSchema = z.object({
    DATABASE_URL: z.string().url(),
    BCRYPT_SALT_ROUNDS: z.number().int().positive(),
});

export const clientEnv = {};

export const serverEnv = {
    DATABASE_URL: process.env.DATABASE_URL,
    BCRYPT_SALT_ROUNDS: process.env.BCRYPT_SALT_ROUNDS ? parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) : undefined,
};
