import { type Prisma, prisma } from "@/server/database";
import { Service } from "typedi";

@Service()
export class AuditLogRepository {
    findMany<T extends Prisma.AuditLogFindManyArgs, Result extends Array<Prisma.AuditLogGetPayload<T>>>(args?: T) {
        return prisma.auditLog.findMany(args) as Promise<Result>;
    }

    findFirst<T extends Prisma.AuditLogFindFirstArgs, Result extends Prisma.AuditLogGetPayload<T> | null>(args?: T) {
        return prisma.auditLog.findFirst(args) as Promise<Result | null>;
    }

    findUnique<T extends Prisma.AuditLogFindUniqueArgs, Result extends Prisma.AuditLogGetPayload<T> | null>(args: T) {
        return prisma.auditLog.findUnique(args) as Promise<Result | null>;
    }

    count<T extends Prisma.AuditLogCountArgs>(args?: T): Promise<number> {
        return prisma.auditLog.count(args);
    }

    update<T extends Prisma.AuditLogUpdateArgs, Result extends Prisma.AuditLogGetPayload<T>>(args: T) {
        return prisma.auditLog.update(args) as Promise<Result>;
    }

    create<T extends Prisma.AuditLogCreateArgs, Result extends Prisma.AuditLogGetPayload<T>>(args: T) {
        return prisma.auditLog.create(args) as Promise<Result>;
    }

    delete<T extends Prisma.AuditLogDeleteArgs, Result extends Prisma.AuditLogGetPayload<T>>(args: T) {
        return prisma.auditLog.delete(args) as Promise<Result>;
    }

    searchList<T extends Prisma.AuditLogFindManyArgs, Result extends Array<Prisma.AuditLogGetPayload<T>>>(args: T) {
        return prisma.$transaction([prisma.auditLog.findMany(args), prisma.auditLog.count()]) as Promise<
            [Result, number]
        >;
    }

    deleteMany<T extends Prisma.AuditLogDeleteManyArgs>(args: T) {
        return prisma.auditLog.deleteMany(args);
    }
}
