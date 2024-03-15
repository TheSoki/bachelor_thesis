import { uuid, pgTable, text } from "drizzle-orm/pg-core";

export const devices = pgTable("devices", {
    id: uuid("id").primaryKey().defaultRandom(),
    token: text("token").unique().notNull(),
    buildingId: text("building").notNull(),
    roomId: text("room").notNull(),
});
