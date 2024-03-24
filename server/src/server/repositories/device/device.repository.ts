import { devices, type DeviceWith, type InsertDevice, type SelectDevice } from "@/db/schema";
import { BaseRepository, type BaseRepositoryDependencies } from "../base/base.repository";
import { count, eq } from "drizzle-orm";
import type { TransactionScope } from "@/db/connection";

export type DeviceRepositoryDependencies = BaseRepositoryDependencies;

type SelectColumns = {
    [K in keyof SelectDevice]?: boolean;
};

export class DeviceRepository extends BaseRepository {
    constructor(dependencies: DeviceRepositoryDependencies) {
        super(dependencies);
    }

    async list<C extends SelectColumns, I extends DeviceWith>({
        limit,
        offset,
        columns,
        include,
    }: {
        limit: number;
        offset: number;
        columns: C;
        include: I;
    }) {
        return this.db.query.devices.findMany({
            columns,
            with: include,
            limit,
            offset,
            orderBy: (devices, { desc }) => [desc(devices.createdAt)],
        });
    }

    async getById<C extends SelectColumns, I extends DeviceWith>({
        id,
        columns,
        include,
    }: {
        id: string;
        columns: C;
        include: I;
    }) {
        return this.db.query.devices.findFirst({
            columns,
            with: include,
            where: (devices, { eq }) => eq(devices.id, id),
        });
    }

    async create(data: Omit<InsertDevice, "id" | "createdAt">) {
        return this.db.insert(devices).values(data);
    }

    async update(id: string, data: Partial<InsertDevice>, transactionScope?: TransactionScope) {
        if (transactionScope) {
            return transactionScope.update(devices).set(data).where(eq(devices.id, id));
        }
        return this.db.update(devices).set(data).where(eq(devices.id, id));
    }

    async delete(id: string, transactionScope?: TransactionScope) {
        if (transactionScope) {
            return transactionScope.delete(devices).where(eq(devices.id, id));
        }
        return this.db.delete(devices).where(eq(devices.id, id));
    }

    async totalCount() {
        return this.db.select({ value: count() }).from(devices);
    }
}
