import { router, authedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { devices, type InsertDevice } from "@/db/schema/devices";
import { count, eq } from "drizzle-orm";
import { deviceSchema, createDeviceSchema, updateDeviceSchema } from "../schema/device";
import { paginationSchema } from "../schema/general";

const defaultDeviceSelect = {
    id: true,
    createdAt: true,
    buildingId: true,
    roomId: true,
    lastSeen: true,
    displayWidth: true,
    displayHeight: true,
} satisfies {
    [K in keyof InsertDevice]?: boolean;
};

const limit = 10 as const;

export const deviceRouter = router({
    list: authedProcedure.input(paginationSchema).query(async ({ ctx, input }) => {
        const offset = (input.page - 1) * limit;

        try {
            const list = await ctx.db.query.devices.findMany({
                columns: defaultDeviceSelect,
                limit,
                offset,
                orderBy: (devices, { asc }) => [asc(devices.createdAt)],
            });

            const totalCountQuery = await ctx.db.select({ value: count() }).from(devices);
            const totalCount = totalCountQuery[0]?.value ?? 0;
            const totalPages = Math.ceil(totalCount / limit);

            return {
                list,
                page: input.page,
                totalPages,
                totalCount,
            };
        } catch (e) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Error fetching devices",
            });
        }
    }),
    byId: authedProcedure.input(deviceSchema).query(async ({ ctx, input }) => {
        const { id } = input;

        try {
            const device = await ctx.db.query.devices.findFirst({
                columns: defaultDeviceSelect,
                where: (devices, { eq }) => eq(devices.id, id),
            });

            if (!device) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: `No device with id '${id}'`,
                });
            }

            return device;
        } catch (e) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: `No device with id '${id}'`,
            });
        }
    }),
    add: authedProcedure.input(createDeviceSchema).mutation(async ({ ctx, input }) => {
        const { buildingId, roomId, displayHeight, displayWidth } = input;

        try {
            const device = await ctx.db
                .insert(devices)
                .values({
                    buildingId,
                    roomId,
                    displayHeight,
                    displayWidth,
                })
                .returning({ insertedId: devices.id });

            return device;
        } catch (e) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Error adding device",
            });
        }
    }),
    update: authedProcedure.input(updateDeviceSchema).mutation(async ({ ctx, input }) => {
        const { id, buildingId, roomId, displayHeight, displayWidth } = input;

        try {
            const set: Partial<InsertDevice> = {};
            if (!!buildingId) set.buildingId = buildingId;
            if (!!roomId) set.roomId = roomId;
            if (!!displayHeight) set.displayHeight = displayHeight;
            if (!!displayWidth) set.displayWidth = displayWidth;

            const device = await ctx.db
                .update(devices)
                .set(set)
                .where(eq(devices.id, id))
                .returning({ updatedId: devices.id });

            return device;
        } catch (e) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: `Error updating device with id '${id}'`,
            });
        }
    }),
    delete: authedProcedure.input(deviceSchema).mutation(async ({ ctx, input }) => {
        const { id } = input;

        try {
            const device = await ctx.db.delete(devices).where(eq(devices.id, id)).returning({ deletedId: devices.id });

            return device;
        } catch (e) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: `Error deleting device with id '${id}'`,
            });
        }
    }),
    getDeviceToken: authedProcedure.input(deviceSchema).query(async ({ ctx, input }) => {
        const { id } = input;

        try {
            const device = await ctx.db.query.devices.findFirst({
                columns: {
                    id: true,
                    token: true,
                },
                where: (devices, { eq }) => eq(devices.id, id),
            });

            if (!device) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: `No device with id '${id}'`,
                });
            }

            return device;
        } catch (e) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: `No device with id '${id}'`,
            });
        }
    }),
});
