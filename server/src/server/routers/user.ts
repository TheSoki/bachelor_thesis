import { router, authedProcedure } from "../trpc";
import { userSchema, userCreateSchema, userUpdateSchema, userListSchema } from "../schema/user";
import { TRPCError } from "@trpc/server";

export const userRouter = router({
    list: authedProcedure.input(userListSchema).query(async ({ ctx, input }) => {
        try {
            return ctx.userService.list(input);
        } catch (e) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Error fetching users",
            });
        }
    }),
    getById: authedProcedure.input(userSchema).query(async ({ ctx, input }) => {
        try {
            return ctx.userService.getById(input);
        } catch (e) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: `No user with id '${input.id}'`,
            });
        }
    }),
    create: authedProcedure.input(userCreateSchema).mutation(async ({ ctx, input }) => {
        try {
            return ctx.userService.create(input);
        } catch (e) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Error adding user",
            });
        }
    }),
    update: authedProcedure.input(userUpdateSchema).mutation(async ({ ctx, input }) => {
        try {
            return ctx.userService.update(input);
        } catch (e) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: `Error updating user with id '${input.id}'`,
            });
        }
    }),
    delete: authedProcedure.input(userSchema).mutation(async ({ ctx, input }) => {
        try {
            return ctx.userService.delete(input);
        } catch (e) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: `Error deleting user with id '${input.id}'`,
            });
        }
    }),
});
