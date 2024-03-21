ALTER TABLE "devices" ADD COLUMN "lastSeen" timestamp;--> statement-breakpoint
ALTER TABLE "devices" ADD COLUMN "displayWidth" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "devices" ADD COLUMN "displayHeight" integer NOT NULL;