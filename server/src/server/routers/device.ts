import { router, authedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { devices, type InsertDevice } from "@/db/schema";
import { count, eq } from "drizzle-orm";
import { deviceSchema, createDeviceSchema, updateDeviceSchema } from "../schema/device";
import { paginationSchema } from "../schema/general";

const defaultDeviceSelect = {
    id: true,
    createdAt: true,
    buildingId: true,
    roomId: true,
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
                columns: { ...defaultDeviceSelect, lastSeen: true },
                with: {
                    author: {
                        columns: { id: true, name: true },
                    },
                },
                limit,
                offset,
                orderBy: (devices, { desc }) => [desc(devices.createdAt)],
            });

            const totalCountQuery = await ctx.db.select({ value: count() }).from(devices);
            const totalCount = totalCountQuery[0]?.value ?? 0;

            const totalPages = Math.ceil(totalCount / limit);

            return {
                list,
                page: input.page,
                totalPages: totalPages === 0 ? 1 : totalPages,
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
                    authorId: ctx.user.id,
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
            const data: Partial<InsertDevice> = {
                buildingId,
                roomId,
                displayHeight,
                displayWidth,
            };

            const device = await ctx.db
                .update(devices)
                .set(data)
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
