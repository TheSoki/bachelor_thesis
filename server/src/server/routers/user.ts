import { router } from "../trpc";
import { userSchema, userCreateSchema, userUpdateSchema, userListSchema } from "../schema/user";
import { TRPCError } from "@trpc/server";
import { UserService } from "../services/user.service";
import { authedProcedure } from "../procedures/authed";

export const userRouter = router({
    list: authedProcedure.input(userListSchema).query(async ({ ctx, input }) => {
        try {
            return ctx.container.get(UserService).list(input);
        } catch (e) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Error fetching users",
            });
        }
    }),
    getById: authedProcedure.input(userSchema).query(async ({ ctx, input }) => {
        try {
            return ctx.container.get(UserService).getById(input);
        } catch (e) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: `No user with id '${input.id}'`,
            });
        }
    }),
    create: authedProcedure.input(userCreateSchema).mutation(async ({ ctx, input }) => {
        try {
            return ctx.container.get(UserService).create(input);
        } catch (e) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Error adding user",
            });
        }
    }),
    update: authedProcedure.input(userUpdateSchema).mutation(async ({ ctx, input }) => {
        try {
            return ctx.container.get(UserService).update(input);
        } catch (e) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: `Error updating user with id '${input.id}'`,
            });
        }
    }),
    delete: authedProcedure.input(userSchema).mutation(async ({ ctx, input }) => {
        try {
            return ctx.container.get(UserService).delete(input);
        } catch (e) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: `Error deleting user with id '${input.id}'`,
            });
        }
    }),
});
