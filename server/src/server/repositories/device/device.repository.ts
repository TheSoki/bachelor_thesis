import { Prisma, prisma } from "@/database";
import { BaseRepository } from "../base/base.repository";

export class DeviceRepository extends BaseRepository {
    findMany<T extends Prisma.DeviceFindManyArgs, Result extends Array<Prisma.DeviceGetPayload<T>>>(args?: T) {
        return prisma.device.findMany(args) as Promise<Result>;
    }

    findFirst<T extends Prisma.DeviceFindFirstArgs, Result extends Prisma.DeviceGetPayload<T> | null>(args?: T) {
        return prisma.device.findFirst(args) as Promise<Result | null>;
    }

    findUnique<T extends Prisma.DeviceFindUniqueArgs, Result extends Prisma.DeviceGetPayload<T> | null>(args: T) {
        return prisma.device.findUnique(args) as Promise<Result | null>;
    }

    count<T extends Prisma.DeviceCountArgs>(args?: T): Promise<number> {
        return prisma.device.count(args);
    }

    update<T extends Prisma.DeviceUpdateArgs, Result extends Prisma.DeviceGetPayload<T>>(args: T) {
        return prisma.device.update(args) as Promise<Result>;
    }

    create<T extends Prisma.DeviceCreateArgs, Result extends Prisma.DeviceGetPayload<T>>(args: T) {
        return prisma.device.create(args) as Promise<Result>;
    }

    delete<T extends Prisma.DeviceDeleteArgs, Result extends Prisma.DeviceGetPayload<T>>(args: T) {
        return prisma.device.delete(args) as Promise<Result>;
    }
}
