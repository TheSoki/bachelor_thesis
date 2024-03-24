import { router, authedProcedure } from "../trpc";
import { paginationSchema } from "../schema/general";
import { userSchema, createUserSchema, updateUserSchema } from "../schema/user";

export const userRouter = router({
    list: authedProcedure.input(paginationSchema).query(async ({ ctx, input }) => {
        return ctx.userService.list(input);
    }),
    getById: authedProcedure.input(userSchema).query(async ({ ctx, input }) => {
        return ctx.userService.getById(input);
    }),
    create: authedProcedure.input(createUserSchema).mutation(async ({ ctx, input }) => {
        return ctx.userService.create(input);
    }),
    update: authedProcedure.input(updateUserSchema).mutation(async ({ ctx, input }) => {
        return ctx.userService.update(input);
    }),
    delete: authedProcedure.input(userSchema).mutation(async ({ ctx, input }) => {
        return ctx.userService.delete(input);
    }),
});
