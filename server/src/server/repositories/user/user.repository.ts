import { users, type InsertUser, type UserWith } from "@/db/schema";
import { BaseRepository, type BaseRepositoryDependencies } from "../base/base.repository";
import { count, eq } from "drizzle-orm";
import type { TransactionScope } from "@/db/connection";

export type UserRepositoryDependencies = BaseRepositoryDependencies;

type SelectColumns = {
    [K in keyof InsertUser]?: boolean;
};

export class UserRepository extends BaseRepository {
    constructor(dependencies: UserRepositoryDependencies) {
        super(dependencies);
    }

    async list<C extends SelectColumns, I extends UserWith>({
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
        return this.db.query.users.findMany({
            columns,
            with: include,
            limit,
            offset,
            orderBy: (users, { desc }) => [desc(users.createdAt)],
        });
    }

    async getById<C extends SelectColumns, I extends UserWith>({
        id,
        columns,
        include,
    }: {
        id: string;
        columns: C;
        include: I;
    }) {
        return this.db.query.users.findFirst({
            columns,
            with: include,
            where: (users, { eq }) => eq(users.id, id),
        });
    }

    async create(data: Omit<InsertUser, "createdAt">) {
        return this.db.insert(users).values(data);
    }

    async update(id: string, data: Partial<InsertUser>, transactionScope?: TransactionScope) {
        if (transactionScope) {
            return transactionScope.update(users).set(data).where(eq(users.id, id));
        }
        return this.db.update(users).set(data).where(eq(users.id, id));
    }

    async delete(id: string, transactionScope?: TransactionScope) {
        if (transactionScope) {
            return transactionScope.delete(users).where(eq(users.id, id));
        }
        return this.db.delete(users).where(eq(users.id, id));
    }

    async totalCount() {
        return this.db.select({ value: count() }).from(users);
    }
}
