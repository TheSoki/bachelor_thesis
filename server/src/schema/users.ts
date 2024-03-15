import { uuid, pgTable, text } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    createdAt: text("createdAt").notNull().default("now()"),
    email: text("email").unique().notNull(),
    password: text("password").notNull(),
});
