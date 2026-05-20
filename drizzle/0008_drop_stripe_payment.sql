ALTER TABLE "appointment" DROP CONSTRAINT IF EXISTS "appointment_stripe_checkout_session_id_unique";
--> statement-breakpoint
ALTER TABLE "appointment" DROP COLUMN IF EXISTS "stripe_checkout_session_id";
--> statement-breakpoint
ALTER TABLE "appointment" DROP COLUMN IF EXISTS "stripe_payment_intent_id";
--> statement-breakpoint
ALTER TABLE "appointment" DROP COLUMN IF EXISTS "amount_cents";
--> statement-breakpoint
ALTER TABLE "appointment" DROP COLUMN IF EXISTS "currency";
