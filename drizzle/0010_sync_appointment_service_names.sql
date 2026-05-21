UPDATE "appointment" AS a
SET "service_id" = s.id
FROM "service" AS s
WHERE
	a.service_id IS NULL
	AND lower(trim(a.service_name)) = lower(trim(s.name));
--> statement-breakpoint
UPDATE "appointment" AS a
SET "service_name" = s.name
FROM "service" AS s
WHERE a.service_id = s.id AND a.service_name IS DISTINCT FROM s.name;
