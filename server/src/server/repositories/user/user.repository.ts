import { Prisma, prisma } from "@/database";
import { BaseRepository } from "../base/base.repository";

export class UserRepository extends BaseRepository {
    findMany<T extends Prisma.UserFindManyArgs, Result extends Array<Prisma.UserGetPayload<T>>>(args?: T) {
        return prisma.user.findMany(args) as Promise<Result>;
    }

    findFirst<T extends Prisma.UserFindFirstArgs, Result extends Prisma.UserGetPayload<T> | null>(args?: T) {
        return prisma.user.findFirst(args) as Promise<Result | null>;
    }

    findUnique<T extends Prisma.UserFindUniqueArgs, Result extends Prisma.UserGetPayload<T> | null>(args: T) {
        return prisma.user.findUnique(args) as Promise<Result | null>;
    }

    count<T extends Prisma.UserCountArgs>(args?: T): Promise<number> {
        return prisma.user.count(args);
    }

    update<T extends Prisma.UserUpdateArgs, Result extends Prisma.UserGetPayload<T>>(args: T) {
        return prisma.user.update(args) as Promise<Result>;
    }

    create<T extends Prisma.UserCreateArgs, Result extends Prisma.UserGetPayload<T>>(args: T) {
        return prisma.user.create(args) as Promise<Result>;
    }

    delete<T extends Prisma.UserDeleteArgs, Result extends Prisma.UserGetPayload<T>>(args: T) {
        return prisma.user.delete(args) as Promise<Result>;
    }
}
