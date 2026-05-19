import { fail, redirect } from '@sveltejs/kit';
import { and, asc, eq, gte, lt } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { fromDateAndTime } from '$lib/calendar/datetime';
import {
	addWeeks,
	formatWeekParam,
	getWeekDays,
	getWeekMonday,
	getWeekRange,
	parseWeekParam
} from '$lib/calendar/week';
import { AppointmentStatus } from '$lib/server/appointment/status';
import { auth } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { appointment } from '$lib/server/db/schema';

function weekFromForm(formData: FormData, url: URL): string {
	const raw = formData.get('week');
	if (typeof raw === 'string' && raw.trim() !== '') {
		return formatWeekParam(parseWeekParam(raw.trim()));
	}
	return formatWeekParam(parseWeekParam(url.searchParams.get('week')));
}

export const load: PageServerLoad = async ({ url }) => {
	const weekStart = parseWeekParam(url.searchParams.get('week'));
	const { start, end } = getWeekRange(weekStart);

	const appointments = await db
		.select()
		.from(appointment)
		.where(and(gte(appointment.startsAt, start), lt(appointment.startsAt, end)))
		.orderBy(asc(appointment.startsAt));

	return {
		weekStart: weekStart.toISOString(),
		weekParam: formatWeekParam(weekStart),
		weekDays: getWeekDays(weekStart).map((d) => d.toISOString()),
		prevWeek: formatWeekParam(addWeeks(weekStart, -1)),
		nextWeek: formatWeekParam(addWeeks(weekStart, 1)),
		currentWeek: formatWeekParam(getWeekMonday(new Date())),
		appointments
	};
};

export const actions: Actions = {
	cancel: async ({ request, url }) => {
		const formData = await request.formData();
		const appointmentId = formData.get('appointmentId');
		const week = weekFromForm(formData, url);

		if (typeof appointmentId !== 'string' || appointmentId === '') {
			return fail(400, { message: 'Missing appointment.' });
		}

		await db
			.update(appointment)
			.set({ status: AppointmentStatus.Cancelled })
			.where(
				and(
					eq(appointment.id, appointmentId),
					eq(appointment.status, AppointmentStatus.Upcoming)
				)
			);

		throw redirect(303, `/dashboard?week=${week}`);
	},

	reschedule: async ({ request, url }) => {
		const formData = await request.formData();
		const appointmentId = formData.get('appointmentId');
		const appointmentDate = formData.get('appointmentDate');
		const appointmentTime = formData.get('appointmentTime');
		const week = weekFromForm(formData, url);

		if (typeof appointmentId !== 'string' || appointmentId === '') {
			return fail(400, { message: 'Missing appointment.', appointmentId: null, week });
		}

		if (
			typeof appointmentDate !== 'string' ||
			appointmentDate.trim() === '' ||
			typeof appointmentTime !== 'string' ||
			appointmentTime.trim() === ''
		) {
			return fail(400, {
				message: 'Date and time required.',
				appointmentId,
				week
			});
		}

		const startsAtDate = fromDateAndTime(appointmentDate.trim(), appointmentTime.trim());
		if (Number.isNaN(startsAtDate.getTime())) {
			return fail(400, {
				message: 'Invalid date.',
				appointmentId,
				week
			});
		}

		if (startsAtDate <= new Date()) {
			return fail(400, {
				message: 'Appointment must be in the future.',
				appointmentId,
				week
			});
		}

		const [row] = await db
			.select()
			.from(appointment)
			.where(eq(appointment.id, appointmentId))
			.limit(1);

		if (!row) {
			return fail(404, { message: 'Appointment not found.', appointmentId, week });
		}

		if (row.status === AppointmentStatus.Cancelled) {
			return fail(400, {
				message: 'Cannot reschedule a cancelled appointment.',
				appointmentId,
				week
			});
		}

		await db
			.update(appointment)
			.set({ startsAt: startsAtDate })
			.where(eq(appointment.id, appointmentId));

		const targetWeek = formatWeekParam(getWeekMonday(startsAtDate));
		throw redirect(303, `/dashboard?week=${targetWeek}`);
	},

	signOut: async (event) => {
		await auth.api.signOut({
			headers: event.request.headers
		});
		throw redirect(302, '/login');
	}
};
