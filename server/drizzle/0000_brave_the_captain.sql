CREATE TABLE IF NOT EXISTS "devices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"token" uuid DEFAULT gen_random_uuid() NOT NULL,
	"building" text NOT NULL,
	"room" text NOT NULL,
	"lastSeen" timestamp,
	"displayWidth" integer NOT NULL,
	"displayHeight" integer NOT NULL,
	"authorId" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
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
