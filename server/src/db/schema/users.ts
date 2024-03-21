import { uuid, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { relations, type InferInsertModel, type InferSelectModel } from "drizzle-orm";
import { devices } from "./devices";

export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    name: text("name").notNull(),
    email: text("email").unique().notNull(),
    password: text("password").notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
    devices: many(devices),
}));

export type SelectUser = InferSelectModel<typeof users>;
export type InsertUser = InferInsertModel<typeof users>;
