import { router, authedProcedure } from "../trpc";
import { paginationSchema } from "../schema/general";
import { deviceSchema, createDeviceSchema, updateDeviceSchema } from "../schema/device";

export const deviceRouter = router({
    list: authedProcedure.input(paginationSchema).query(async ({ ctx, input }) => {
        return ctx.deviceService.list(input);
    }),
    getById: authedProcedure.input(deviceSchema).query(async ({ ctx, input }) => {
        return ctx.deviceService.getById(input);
    }),
    create: authedProcedure.input(createDeviceSchema).mutation(async ({ ctx, input }) => {
        return ctx.deviceService.create(input, ctx.user.id);
    }),
    update: authedProcedure.input(updateDeviceSchema).mutation(async ({ ctx, input }) => {
        return ctx.deviceService.update(input);
    }),
    delete: authedProcedure.input(deviceSchema).mutation(async ({ ctx, input }) => {
        return ctx.deviceService.delete(input);
    }),
    getDeviceToken: authedProcedure.input(deviceSchema).query(async ({ ctx, input }) => {
        return ctx.deviceService.getDeviceToken(input);
    }),
});
