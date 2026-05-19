UPDATE "appointment" SET "status" = 'pending' WHERE "status" = 'awaiting_payment';
--> statement-breakpoint
UPDATE "appointment" SET "status" = 'upcoming' WHERE "status" = 'confirmed';
--> statement-breakpoint
DROP TABLE IF EXISTS "task";
