import { uuid, pgTable, text, timestamp, integer } from "drizzle-orm/pg-core";
import { relations, type InferInsertModel, type InferSelectModel } from "drizzle-orm";

//! Users
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

//! Devices
export const devices = pgTable("devices", {
    id: uuid("id").primaryKey().defaultRandom(),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    token: uuid("token").notNull().defaultRandom(),
    buildingId: text("building").notNull(),
    roomId: text("room").notNull(),
    lastSeen: timestamp("lastSeen"),
    displayWidth: integer("displayWidth").notNull(),
    displayHeight: integer("displayHeight").notNull(),
    authorId: uuid("authorId").references(() => users.id),
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
export type SelectDevice = InferSelectModel<typeof devices>;
export type InsertDevice = InferInsertModel<typeof devices>;
