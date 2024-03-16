import { uuid, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    email: text("email").unique().notNull(),
    password: text("password").notNull(),
});
