ALTER TABLE "appointment" ADD COLUMN "service_name" text;
--> statement-breakpoint
ALTER TABLE "appointment" ADD COLUMN "is_confirmed" boolean DEFAULT true NOT NULL;
--> statement-breakpoint
ALTER TABLE "appointment" ADD COLUMN "reminder_sent_at" timestamp with time zone;
--> statement-breakpoint
UPDATE "appointment" SET "service_name" = 'Appointment' WHERE "service_name" IS NULL;
--> statement-breakpoint
ALTER TABLE "appointment" ALTER COLUMN "service_name" SET NOT NULL;
