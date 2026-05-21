CREATE TABLE "service" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"duration_minutes" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "service_name_unique" UNIQUE("name")
);
--> statement-breakpoint
INSERT INTO "service" ("name", "duration_minutes") VALUES
	('Service 1', 60),
	('Service 2', 60),
	('Service 3', 60),
	('Service 4', 60);
--> statement-breakpoint
ALTER TABLE "appointment" ADD COLUMN "service_id" uuid;
--> statement-breakpoint
ALTER TABLE "appointment" ADD COLUMN "duration_minutes" integer DEFAULT 60 NOT NULL;
--> statement-breakpoint
ALTER TABLE "appointment" ADD CONSTRAINT "appointment_service_id_service_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."service"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
UPDATE "appointment" AS a
SET
	"service_id" = s.id,
	"duration_minutes" = 60
FROM "service" AS s
WHERE a.service_name = s.name;
