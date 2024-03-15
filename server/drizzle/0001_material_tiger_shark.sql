ALTER TABLE "devices" ADD COLUMN "createdAt" text DEFAULT 'now()' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "createdAt" text DEFAULT 'now()' NOT NULL;