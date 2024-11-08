import type { z } from "zod";
import type { userSchema, userCreateSchema, userUpdateSchema, userListSchema } from "@/server/schema/user";
import { hash } from "bcrypt";
import { serverEnv } from "@/env/server";
import { Prisma, prisma, type User } from "@/server/database";
import { Service } from "typedi";
import { UserRepository } from "../repositories/user.repository";
import { LoggerRepository } from "../repositories/logger.repository";

export const defaultColumns = {
    id: true,
    createdAt: true,
    name: true,
    email: true,
} satisfies {
    [K in keyof User]?: boolean;
};

@Service()
export class UserService {
    constructor(
        private readonly logger: LoggerRepository,
        private readonly userRepository: UserRepository,
    ) {}

    async list({ page, limit, search }: z.infer<typeof userListSchema>) {
        const skip = (page - 1) * limit;

        const where: Prisma.UserWhereInput | undefined = !!search
            ? {
                  OR: [
                      {
                          name: { contains: search, mode: "insensitive" },
                      },
                      {
                          email: { contains: search, mode: "insensitive" },
                      },
                  ],
              }
            : undefined;

        try {
            const [list, totalCount] = await this.userRepository.searchList({
                where,
                take: limit,
                skip,
                select: defaultColumns,
            });

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

    async create(input: z.infer<typeof userCreateSchema>) {
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

    async update(input: z.infer<typeof userUpdateSchema>) {
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
            await prisma.$transaction([
                prisma.device.deleteMany({ where: { authorId: id } }),
                prisma.user.delete({ where: { id } }),
            ]);
        } catch (e) {
            this.logger.error(`Error deleting user with id '${id}': ${e}`);

            throw new Error(`Error deleting user with id '${id}'`);
        }
    }
}
