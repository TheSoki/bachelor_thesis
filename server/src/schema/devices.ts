import { uuid, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const devices = pgTable("devices", {
    id: uuid("id").primaryKey().defaultRandom(),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    token: text("token").unique().notNull(),
    buildingId: text("building").notNull(),
    roomId: text("room").notNull(),
});
