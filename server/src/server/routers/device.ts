import { router, authedProcedure } from "../trpc";
import { deviceSchema, deviceCreateSchema, deviceUpdateSchema, deviceListSchema } from "../schema/device";
import { TRPCError } from "@trpc/server";

export const deviceRouter = router({
    list: authedProcedure.input(deviceListSchema).query(async ({ ctx, input }) => {
        try {
            return ctx.deviceService.list(input);
        } catch (e) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Error fetching devices",
            });
        }
    }),
    getById: authedProcedure.input(deviceSchema).query(async ({ ctx, input }) => {
        try {
            return ctx.deviceService.getById(input);
        } catch (e) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: `No device with id '${input.id}'`,
            });
        }
    }),
    create: authedProcedure.input(deviceCreateSchema).mutation(async ({ ctx, input }) => {
        try {
            return ctx.deviceService.create(input, ctx.user.id);
        } catch (e) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Error adding device",
            });
        }
    }),
    update: authedProcedure.input(deviceUpdateSchema).mutation(async ({ ctx, input }) => {
        try {
            return ctx.deviceService.update(input);
        } catch (e) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: `Error updating device with id '${input.id}'`,
            });
        }
    }),
    delete: authedProcedure.input(deviceSchema).mutation(async ({ ctx, input }) => {
        try {
            return ctx.deviceService.delete(input);
        } catch (e) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: `Error deleting device with id '${input.id}'`,
            });
        }
    }),
    getDeviceToken: authedProcedure.input(deviceSchema).query(async ({ ctx, input }) => {
        try {
            return ctx.deviceService.getDeviceToken(input);
        } catch (e) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: `No device with id '${input.id}'`,
            });
        }
    }),
});
