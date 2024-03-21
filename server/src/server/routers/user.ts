import { router, authedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { users, type InsertUser } from "@/db/schema/users";
import { count, eq } from "drizzle-orm";
import { paginationSchema } from "../schema/general";
import { userSchema, createUserSchema, updateUserSchema } from "../schema/user";
import { hash } from "bcrypt";
import { serverEnv } from "@/env/server";

const defaultUserSelect = {
    id: true,
    createdAt: true,
    name: true,
    email: true,
} satisfies {
    [K in keyof InsertUser]?: boolean;
};

const limit = 10 as const;

export const userRouter = router({
    list: authedProcedure.input(paginationSchema).query(async ({ ctx, input }) => {
        const offset = (input.page - 1) * limit;

        try {
            const list = await ctx.db.query.users.findMany({
                columns: defaultUserSelect,
                limit,
                offset,
                orderBy: (users, { desc }) => [desc(users.createdAt)],
            });

            const totalCountQuery = await ctx.db.select({ value: count() }).from(users);
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
                message: "Error fetching users",
            });
        }
    }),
    byId: authedProcedure.input(userSchema).query(async ({ ctx, input }) => {
        const { id } = input;
        try {
            const user = await ctx.db.query.users.findFirst({
                columns: defaultUserSelect,
                where: (users, { eq }) => eq(users.id, id),
            });

            if (!user) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: `No user with id '${id}'`,
                });
            }

            return user;
        } catch (e) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: `No user with id '${id}'`,
            });
        }
    }),
    add: authedProcedure.input(createUserSchema).mutation(async ({ ctx, input }) => {
        const { email, name, password } = input;

        try {
            const hashedPassword = await hash(password, serverEnv.BCRYPT_SALT_ROUNDS);

            const user = await ctx.db
                .insert(users)
                .values({
                    name,
                    email,
                    password: hashedPassword,
                })
                .returning({ insertedId: users.id });

            return user;
        } catch (e) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Error adding user",
            });
        }
    }),
    update: authedProcedure.input(updateUserSchema).mutation(async ({ ctx, input }) => {
        const { id, email, name, password } = input;

        try {
            const data: Partial<InsertUser> = {
                email,
                name,
            };
            if (!!password) data.password = await hash(password, serverEnv.BCRYPT_SALT_ROUNDS);

            const user = await ctx.db
                .update(users)
                .set(data)
                .where(eq(users.id, id))
                .returning({ updatedId: users.id });

            return user;
        } catch (e) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: `Error updating user with id '${id}'`,
            });
        }
    }),
    delete: authedProcedure.input(userSchema).mutation(async ({ ctx, input }) => {
        const { id } = input;

        try {
            const user = await ctx.db.delete(users).where(eq(users.id, id)).returning({ deletedId: users.id });

            return user;
        } catch (e) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: `Error deleting user with id '${id}'`,
            });
        }
    }),
});
