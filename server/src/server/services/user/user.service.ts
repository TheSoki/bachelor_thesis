import type { UserRepository } from "@/server/repositories/user/user.repository";
import { BaseService, type BaseServiceDependencies } from "../base/base.service";
import type { z } from "zod";
import type { paginationSchema } from "@/server/schema/general";
import type { createUserSchema, updateUserSchema, userSchema } from "@/server/schema/user";
import { hash } from "bcrypt";
import { serverEnv } from "@/env/server";
import type { DeviceRepository } from "@/server/repositories/device/device.repository";
import { prisma, type User } from "@/database";

const limit = 10 as const;

export const defaultColumns = {
    id: true,
    createdAt: true,
    name: true,
    email: true,
} satisfies {
    [K in keyof User]?: boolean;
};

export type UserServiceDependencies = {
    userRepository: UserRepository;
    deviceRepository: DeviceRepository;
} & BaseServiceDependencies;

export class UserService extends BaseService {
    private userRepository: UserRepository;

    constructor(dependencies: UserServiceDependencies) {
        super(dependencies);

        this.userRepository = dependencies.userRepository;
    }

    async list(input: z.infer<typeof paginationSchema>) {
        const skip = (input.page - 1) * limit;

        try {
            const list = await this.userRepository.findMany({
                take: limit,
                skip,
                select: defaultColumns,
            });
            const totalCount = await this.userRepository.count();
            const totalPages = Math.ceil(totalCount / limit);

            return {
                list,
                totalPages: totalPages === 0 ? 1 : totalPages,
                totalCount,
            };
        } catch (e) {
            this.logger.error(`Error fetching users: ${e}`);

            throw new Error("Error fetching users");
        }
    }

    async getById(input: z.infer<typeof userSchema>) {
        const { id } = input;
        try {
            const user = await this.userRepository.findFirst({
                where: { id },
                select: defaultColumns,
            });

            if (!user) {
                throw new Error("User not found");
            }

            return user;
        } catch (e) {
            this.logger.error(`Error fetching user with id '${id}': ${e}`);

            throw new Error(`No user with id '${id}'`);
        }
    }

    async create(input: z.infer<typeof createUserSchema>) {
        const { email, name, password } = input;

        try {
            const hashedPassword = await hash(password, serverEnv.BCRYPT_SALT_ROUNDS);

            await this.userRepository.create({
                data: { name, email, password: hashedPassword },
            });
        } catch (e) {
            this.logger.error(`Error adding user: ${e}`);

            throw new Error("Error adding user");
        }
    }

    async update(input: z.infer<typeof updateUserSchema>) {
        const { id, email, name, password } = input;

        try {
            const data: Partial<User> = {
                email,
                name,
            };
            if (!!password) data.password = await hash(password, serverEnv.BCRYPT_SALT_ROUNDS);

            await this.userRepository.update({
                where: { id },
                data,
            });
        } catch (e) {
            this.logger.error(`Error updating user with id '${id}': ${e}`);

            throw new Error(`Error updating user with id '${id}'`);
        }
    }

    async delete(input: z.infer<typeof userSchema>) {
        const { id } = input;

        try {
            await prisma.$transaction(async (trx) => {
                await trx.device.deleteMany({ where: { authorId: id } });
                await trx.user.delete({ where: { id } });
            });
        } catch (e) {
            this.logger.error(`Error deleting user with id '${id}': ${e}`);

            throw new Error(`Error deleting user with id '${id}'`);
        }
    }
}
