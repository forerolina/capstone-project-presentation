import { fail } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { AppointmentStatus } from '$lib/server/appointment/status';
import { parseConfirmToken } from '$lib/server/appointment/confirm-token';
import { getBusinessTimezone } from '$lib/server/calendar/timezone';
import { db } from '$lib/server/db';
import { appointment } from '$lib/server/db/schema';

export const load: PageServerLoad = async ({ url }) => {
	const token = url.searchParams.get('t');
	const businessTimezone = getBusinessTimezone();

	if (!token) {
		return { appointment: null, error: 'invalid' as const, businessTimezone };
	}

	const appointmentId = parseConfirmToken(token);
	if (!appointmentId) {
		return { appointment: null, error: 'invalid' as const, businessTimezone };
	}

	const [row] = await db
		.select()
		.from(appointment)
		.where(eq(appointment.id, appointmentId))
		.limit(1);

	if (!row) {
		return { appointment: null, error: 'invalid' as const, businessTimezone };
	}

	if (row.status === AppointmentStatus.Cancelled) {
		return { appointment: null, error: 'cancelled' as const, businessTimezone };
	}

	if (!row.reminderSentAt) {
		return { appointment: null, error: 'not_ready' as const, businessTimezone };
	}

	return {
		appointment: row,
		error: null,
		businessTimezone,
		token
	};
};

export const actions: Actions = {
	confirm: async ({ request }) => {
		const formData = await request.formData();
		const token = formData.get('token');

		if (typeof token !== 'string' || token === '') {
			return fail(400, { message: 'This confirmation link is not valid.' });
		}

		const appointmentId = parseConfirmToken(token);
		if (!appointmentId) {
			return fail(400, { message: 'This confirmation link is not valid.' });
		}

		const [row] = await db
			.select()
			.from(appointment)
			.where(eq(appointment.id, appointmentId))
			.limit(1);

		if (!row) {
			return fail(404, { message: 'This appointment could not be found.' });
		}

		if (row.status === AppointmentStatus.Cancelled) {
			return fail(400, { message: 'This appointment has been cancelled.' });
		}

		if (!row.reminderSentAt) {
			return fail(400, { message: 'Confirmation is not available for this appointment yet.' });
		}

		if (row.isConfirmed) {
			return { confirmed: true, alreadyConfirmed: true };
		}

		await db
			.update(appointment)
			.set({ isConfirmed: true })
			.where(
				and(eq(appointment.id, appointmentId), eq(appointment.status, AppointmentStatus.Upcoming))
			);

		return { confirmed: true, alreadyConfirmed: false };
	}
};
