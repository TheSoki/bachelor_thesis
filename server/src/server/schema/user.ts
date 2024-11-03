import { z } from "zod";
import { paginationSchema } from "./general";

const id = z.string().max(255, {
    message: "User ID must be 255 characters or less",
});
const name = z
    .string()
    .min(3, {
        message: "Name must be at least 3 characters",
    })
    .max(255, {
        message: "Name must be 255 characters or less",
    });
const email = z
    .string()
    .email({
        message: "Email must be valid",
    })
    .min(3, {
        message: "Email must be at least 3 characters",
    })
    .max(255, {
        message: "Email must be 255 characters or less",
    });
const password = z
    .string()
    .min(3, {
        message: "Password must be at least 3 characters",
    })
    .max(255, {
        message: "Password must be 255 characters or less",
    });

export const userSchema = z.object({
    id,
});

export const userCreateSchema = z.object({
    name,
    email,
    password,
});

export const userUpdateSchema = z.object({
    id,
    name,
    email,
    password: z
        .string()
        // .min(3, {
        //     message: "Password must be at least 3 characters",
        // })
        .max(255, {
            message: "Password must be 255 characters or less",
        })
        .optional()
        .refine(
            (data) => {
                // if password is not empty, it should be at least 3 characters long
                if (!data) {
                    return true;
                }
                return data.length > 2;
            },
            {
                message: "String must contain at least 3 character(s)",
            },
        ),
});

export const userListSchema = paginationSchema.extend({
    search: z
        .string()
        .max(255, {
            message: "Search must be 255 characters or less",
        })
        .optional(),
});

export const registerSchema = z.object({
    email,
    password,
});
