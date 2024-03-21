import { uuid, pgTable, text, timestamp, integer } from "drizzle-orm/pg-core";
import { relations, type InferInsertModel, type InferSelectModel } from "drizzle-orm";
import { users } from "./users";

export const devices = pgTable("devices", {
    id: uuid("id").primaryKey().defaultRandom(),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    token: uuid("token").notNull().defaultRandom(),
    buildingId: text("building").notNull(),
    roomId: text("room").notNull(),
    lastSeen: timestamp("lastSeen"),
    displayWidth: integer("displayWidth").notNull(),
    displayHeight: integer("displayHeight").notNull(),
    authorId: uuid("authorId")
        .notNull()
        .references(() => users.id),
});

export const devicesRelations = relations(devices, ({ one }) => ({
    author: one(users, {
        fields: [devices.id],
        references: [users.id],
    }),
}));

export type SelectDevice = InferSelectModel<typeof devices>;
export type InsertDevice = InferInsertModel<typeof devices>;
