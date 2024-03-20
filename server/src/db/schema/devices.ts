import { uuid, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

export const devices = pgTable("devices", {
    id: uuid("id").primaryKey().defaultRandom(),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    token: uuid("token").notNull().defaultRandom(),
    buildingId: text("building").notNull(),
    roomId: text("room").notNull(),
});

export type SelectDevice = InferSelectModel<typeof devices>;
export type InsertDevice = InferInsertModel<typeof devices>;
