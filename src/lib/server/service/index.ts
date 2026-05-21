import { and, asc, eq, inArray, isNull, sql } from 'drizzle-orm';
import type { BookingServiceOption } from '$lib/booking/service-catalog';
import { AppointmentStatus } from '$lib/server/appointment/status';
import { db } from '$lib/server/db';
import { appointment, service } from '$lib/server/db/schema';
import type { DeletedServiceUndo, ServiceFormInput } from './schema';

export type { DeletedServiceUndo, ServiceFormInput, ServiceFieldErrors } from './schema';

export async function listServices(): Promise<BookingServiceOption[]> {
	const rows = await db.select().from(service).orderBy(asc(service.name));
	return rows.map((row) => ({
		id: row.id,
		name: row.name,
		durationMinutes: row.durationMinutes
	}));
}

export async function getServiceById(id: string): Promise<BookingServiceOption | null> {
	const [row] = await db.select().from(service).where(eq(service.id, id)).limit(1);
	if (!row) return null;
	return { id: row.id, name: row.name, durationMinutes: row.durationMinutes };
}

export async function createService(input: ServiceFormInput): Promise<{ ok: true } | { ok: false; message: string }> {
	try {
		await db.insert(service).values({
			name: input.name,
			durationMinutes: input.durationMinutes
		});
		return { ok: true };
	} catch (err) {
		if (isUniqueViolation(err)) {
			return { ok: false, message: 'A service with this name already exists.' };
		}
		throw err;
	}
}

function appointmentNameMatches(name: string) {
	return sql`lower(trim(${appointment.serviceName})) = lower(trim(${name}))`;
}

/** Keep appointment labels in sync with the service catalog (links orphans, refreshes names). */
export async function syncAppointmentServiceNames(): Promise<void> {
	const services = await db.select().from(service).orderBy(asc(service.createdAt));

	for (const s of services) {
		await db
			.update(appointment)
			.set({ serviceId: s.id })
			.where(and(isNull(appointment.serviceId), appointmentNameMatches(s.name)));
	}

	for (const s of services) {
		await db
			.update(appointment)
			.set({ serviceName: s.name, durationMinutes: s.durationMinutes })
			.where(eq(appointment.serviceId, s.id));
	}

	const [legacyPlaceholder] = await db
		.select({ count: sql<number>`count(*)::int` })
		.from(appointment)
		.where(and(isNull(appointment.serviceId), sql`lower(trim(${appointment.serviceName})) = 'appointment'`));

	if ((legacyPlaceholder?.count ?? 0) === 1 && services.length > 0) {
		const oldest = services[0];
		await db
			.update(appointment)
			.set({ serviceId: oldest.id, serviceName: oldest.name })
			.where(and(isNull(appointment.serviceId), sql`lower(trim(${appointment.serviceName})) = 'appointment'`));
	}
}

export async function updateService(
	id: string,
	input: ServiceFormInput
): Promise<{ ok: true } | { ok: false; message: string }> {
	try {
		const [existing] = await db.select().from(service).where(eq(service.id, id)).limit(1);
		if (!existing) {
			return { ok: false, message: 'Service not found.' };
		}

		const oldName = existing.name;
		const newName = input.name;

		await db
			.update(service)
			.set({
				name: newName,
				durationMinutes: input.durationMinutes
			})
			.where(eq(service.id, id));

		await db
			.update(appointment)
			.set({ serviceName: newName, durationMinutes: input.durationMinutes })
			.where(eq(appointment.serviceId, id));

		if (oldName !== newName) {
			await db
				.update(appointment)
				.set({ serviceName: newName, serviceId: id })
				.where(and(isNull(appointment.serviceId), appointmentNameMatches(oldName)));
		}

		return { ok: true };
	} catch (err) {
		if (isUniqueViolation(err)) {
			return { ok: false, message: 'A service with this name already exists.' };
		}
		throw err;
	}
}

export async function deleteService(
	id: string
): Promise<
	{ ok: true; warning?: string; undo?: DeletedServiceUndo } | { ok: false; message: string }
> {
	const [row] = await db.select().from(service).where(eq(service.id, id)).limit(1);
	if (!row) {
		return { ok: false, message: 'Service not found.' };
	}

	const linkedAppointments = await db
		.select({ id: appointment.id })
		.from(appointment)
		.where(eq(appointment.serviceId, id));

	const appointmentIds = linkedAppointments.map((appt) => appt.id);

	const [upcoming] = await db
		.select({ count: sql<number>`count(*)::int` })
		.from(appointment)
		.where(
			and(
				eq(appointment.serviceId, id),
				eq(appointment.status, AppointmentStatus.Upcoming)
			)
		);

	const upcomingCount = upcoming?.count ?? 0;

	await db.update(appointment).set({ serviceId: null }).where(eq(appointment.serviceId, id));
	await db.delete(service).where(eq(service.id, id));

	if (upcomingCount > 0) {
		const bookingLabel = upcomingCount === 1 ? 'booking' : 'bookings';
		return {
			ok: true,
			warning: `"${row.name}" was removed from your catalog. This service had ${upcomingCount} upcoming ${bookingLabel} — those appointments are unchanged and will stay on your calendar with the same service name and duration.`,
			undo: {
				id: row.id,
				name: row.name,
				durationMinutes: row.durationMinutes,
				appointmentIds
			}
		};
	}

	return { ok: true };
}

export async function restoreDeletedService(
	undo: DeletedServiceUndo
): Promise<{ ok: true; name: string } | { ok: false; message: string }> {
	const existing = await getServiceById(undo.id);
	if (existing) {
		return { ok: false, message: 'This service is already in your catalog.' };
	}

	try {
		await db.insert(service).values({
			id: undo.id,
			name: undo.name,
			durationMinutes: undo.durationMinutes
		});
	} catch (err) {
		if (isUniqueViolation(err)) {
			return {
				ok: false,
				message: 'Could not restore — a service with this name already exists.'
			};
		}
		throw err;
	}

	if (undo.appointmentIds.length > 0) {
		await db
			.update(appointment)
			.set({ serviceId: undo.id })
			.where(
				and(
					inArray(appointment.id, undo.appointmentIds),
					isNull(appointment.serviceId),
					eq(appointment.serviceName, undo.name)
				)
			);
	}

	return { ok: true, name: undo.name };
}

function isUniqueViolation(err: unknown): boolean {
	return (
		typeof err === 'object' &&
		err !== null &&
		'code' in err &&
		(err as { code: string }).code === '23505'
	);
}
