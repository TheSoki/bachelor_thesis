import type { UserRepository } from "@/server/repositories/user/user.repository";
import { BaseService, type BaseServiceDependencies } from "../base/base.service";
import type { z } from "zod";
import type { paginationSchema } from "@/server/schema/general";
import { TRPCError } from "@trpc/server";
import type { createUserSchema, updateUserSchema, userSchema } from "@/server/schema/user";
import { hash } from "bcrypt";
import { serverEnv } from "@/env/server";
import type { InsertUser, SelectUser } from "@/db/schema";
import type { DeviceRepository } from "@/server/repositories/device/device.repository";
import { db } from "@/db/connection";

const limit = 10 as const;

export const defaultColumns = {
    id: true,
    createdAt: true,
    name: true,
    email: true,
} satisfies {
    [K in keyof SelectUser]?: boolean;
};

export type UserServiceDependencies = {
    userRepository: UserRepository;
    deviceRepository: DeviceRepository;
} & BaseServiceDependencies;

export class UserService extends BaseService {
    private userRepository: UserRepository;
    private deviceRepository: DeviceRepository;

    constructor(dependencies: UserServiceDependencies) {
        super(dependencies);

        this.userRepository = dependencies.userRepository;
        this.deviceRepository = dependencies.deviceRepository;
    }

    async list(input: z.infer<typeof paginationSchema>) {
        const offset = (input.page - 1) * limit;

        try {
            const list = await this.userRepository.list({
                limit,
                offset,
                columns: defaultColumns,
                include: {},
            });
            const totalCountQuery = await this.userRepository.totalCount();
            const totalCount = totalCountQuery[0]?.value ?? 0;
            const totalPages = Math.ceil(totalCount / limit);

            return {
                list,
                totalPages: totalPages === 0 ? 1 : totalPages,
                totalCount,
            };
        } catch (e) {
            this.logger.error(`Error fetching users: ${e}`);

            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Error fetching users",
            });
        }
    }

    async getById(input: z.infer<typeof userSchema>) {
        const { id } = input;
        try {
            const user = await this.userRepository.getById({
                id,
                columns: defaultColumns,
                include: {},
            });

            if (!user) {
                throw new Error("User not found");
            }

            return user;
        } catch (e) {
            this.logger.error(`Error fetching user with id '${id}': ${e}`);

            throw new TRPCError({
                code: "NOT_FOUND",
                message: `No user with id '${id}'`,
            });
        }
    }

    async create(input: z.infer<typeof createUserSchema>) {
        const { email, name, password } = input;

        try {
            const hashedPassword = await hash(password, serverEnv.BCRYPT_SALT_ROUNDS);

            await this.userRepository.create({
                name,
                email,
                password: hashedPassword,
            });
        } catch (e) {
            this.logger.error(`Error adding user: ${e}`);

            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Error adding user",
            });
        }
    }

    async update(input: z.infer<typeof updateUserSchema>) {
        const { id, email, name, password } = input;

        try {
            const data: Partial<InsertUser> = {
                email,
                name,
            };
            if (!!password) data.password = await hash(password, serverEnv.BCRYPT_SALT_ROUNDS);

            await this.userRepository.update(id, data);
        } catch (e) {
            this.logger.error(`Error updating user with id '${id}': ${e}`);

            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: `Error updating user with id '${id}'`,
            });
        }
    }

    async delete(input: z.infer<typeof userSchema>) {
        const { id } = input;

        try {
            await db.transaction(async (trx) => {
                this.deviceRepository.update(id, { authorId: null }, trx);
                this.userRepository.delete(id, trx);
            });
        } catch (e) {
            this.logger.error(`Error deleting user with id '${id}': ${e}`);

            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: `Error deleting user with id '${id}'`,
            });
        }
    }
}
