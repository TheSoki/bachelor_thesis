import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import {
    relations,
    type DBQueryConfig,
    type ExtractTablesWithRelations,
    type InferInsertModel,
    type InferSelectModel,
} from "drizzle-orm";

//! Users
export const users = pgTable("users", {
    id: text("id").primaryKey(),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    name: text("name").notNull(),
    email: text("email").unique().notNull(),
    password: text("password").notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
    devices: many(devices),
}));

//! Devices
export const devices = pgTable("devices", {
    id: text("id").primaryKey(),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    token: text("token").notNull(),
    buildingId: text("building").notNull(),
    roomId: text("room").notNull(),
    lastSeen: timestamp("lastSeen"),
    authorId: text("authorId").references(() => users.id),
});

export const devicesRelations = relations(devices, ({ one }) => ({
    author: one(users, {
        fields: [devices.authorId],
        references: [users.id],
    }),
}));

//! Types
export type SelectUser = InferSelectModel<typeof users>;
export type InsertUser = InferInsertModel<typeof users>;
export type UserWith = {
    devices?: true | DBQueryConfig<"many", false, ExtractTablesWithRelations<typeof schema>>;
};

export type SelectDevice = InferSelectModel<typeof devices>;
export type InsertDevice = InferInsertModel<typeof devices>;
export type DeviceWith = {
    author?: true | DBQueryConfig<"one", false, ExtractTablesWithRelations<typeof schema>>;
};

const schema = {
    users,
    usersRelations,
    devices,
    devicesRelations,
};
