UPDATE "appointment" SET "status" = 'upcoming' WHERE "status" IN ('pending', 'awaiting_payment', 'confirmed');
--> statement-breakpoint
ALTER TABLE "appointment" ALTER COLUMN "amount_cents" DROP NOT NULL;
--> statement-breakpoint
ALTER TABLE "appointment" ALTER COLUMN "currency" DROP NOT NULL;
