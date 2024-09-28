CREATE TABLE IF NOT EXISTS "devices" (
	"id" text PRIMARY KEY NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"token" text NOT NULL,
	"building" text NOT NULL,
	"room" text NOT NULL,
	"lastSeen" timestamp,
	"authorId" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" text PRIMARY KEY NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "devices" ADD CONSTRAINT "devices_authorId_users_id_fk" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
