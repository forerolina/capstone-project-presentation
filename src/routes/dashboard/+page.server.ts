import { fail, redirect } from '@sveltejs/kit';
import { and, asc, eq, gte, lt } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { BOOKING_SERVICES } from '$lib/booking/services';
import { wallClockToDate } from '$lib/calendar/datetime';
import {
	addWeeks,
	formatWeekParam,
	getWeekDayKeys,
	getWeekMondayKeyFromDate,
	getWeekRange,
	parseWeekParam
} from '$lib/calendar/week';
import { canSendAppointmentReminder } from '$lib/appointment/display-status';
import { isSlotAvailable } from '$lib/server/appointment/slots';
import { AppointmentStatus } from '$lib/server/appointment/status';
import { auth } from '$lib/server/auth';
import {
	ownerCreateFormSchema,
	type BookingFieldErrors
} from '$lib/server/booking/schema';
import { getBusinessTimezone } from '$lib/server/calendar/timezone';
import { db } from '$lib/server/db';
import { appointment } from '$lib/server/db/schema';
import { getConfirmUrl } from '$lib/server/appointment/confirm-token';
import { sendAppointmentReminder, sendBookingConfirmation } from '$lib/server/email';

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const UPCOMING_WINDOW_DAYS = 90;

function weekFromForm(formData: FormData, url: URL, timeZone: string): string {
	const raw = formData.get('week');
	if (typeof raw === 'string' && raw.trim() !== '') {
		return formatWeekParam(parseWeekParam(raw.trim(), timeZone));
	}
	return formatWeekParam(parseWeekParam(url.searchParams.get('week'), timeZone));
}

export const load: PageServerLoad = async ({ url }) => {
	const timeZone = getBusinessTimezone();
	const weekMondayKey = parseWeekParam(url.searchParams.get('week'), timeZone);
	const { start, end } = getWeekRange(weekMondayKey, timeZone);
	const [appointments, upcomingAppointments] = await Promise.all([
		db
			.select()
			.from(appointment)
			.where(
				and(
					gte(appointment.startsAt, start),
					lt(appointment.startsAt, end),
					eq(appointment.status, AppointmentStatus.Upcoming)
				)
			)
			.orderBy(asc(appointment.startsAt)),
		db
			.select()
			.from(appointment)
			.where(
				and(
					eq(appointment.status, AppointmentStatus.Upcoming),
					gte(appointment.startsAt, new Date()),
					lt(appointment.startsAt, new Date(Date.now() + UPCOMING_WINDOW_DAYS * MS_PER_DAY))
				)
			)
			.orderBy(asc(appointment.startsAt))
	]);

	return {
		businessTimezone: timeZone,
		weekParam: weekMondayKey,
		weekDays: getWeekDayKeys(weekMondayKey),
		prevWeek: formatWeekParam(addWeeks(weekMondayKey, -1)),
		nextWeek: formatWeekParam(addWeeks(weekMondayKey, 1)),
		currentWeek: formatWeekParam(getWeekMondayKeyFromDate(new Date(), timeZone)),
		appointments,
		upcomingAppointments,
		services: [...BOOKING_SERVICES]
	};
};

export const actions: Actions = {
	cancel: async ({ request, url }) => {
		const timeZone = getBusinessTimezone();
		const formData = await request.formData();
		const appointmentId = formData.get('appointmentId');
		const week = weekFromForm(formData, url, timeZone);

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
		const timeZone = getBusinessTimezone();
		const formData = await request.formData();
		const appointmentId = formData.get('appointmentId');
		const appointmentDate = formData.get('appointmentDate');
		const appointmentTime = formData.get('appointmentTime');
		const week = weekFromForm(formData, url, timeZone);

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

		const startsAtDate = wallClockToDate(
			appointmentDate.trim(),
			appointmentTime.trim(),
			timeZone
		);
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

		const targetWeek = formatWeekParam(getWeekMondayKeyFromDate(startsAtDate, timeZone));
		throw redirect(303, `/dashboard?week=${targetWeek}`);
	},

	create: async ({ request, url }) => {
		const timeZone = getBusinessTimezone();
		const formData = await request.formData();
		const week = weekFromForm(formData, url, timeZone);
		const phoneRaw = formData.get('clientPhone');

		const parsed = ownerCreateFormSchema.safeParse({
			clientName: formData.get('clientName'),
			clientEmail: formData.get('clientEmail'),
			clientPhone:
				typeof phoneRaw === 'string' && phoneRaw.trim() !== '' ? phoneRaw : undefined,
			serviceName: formData.get('serviceName'),
			appointmentDate: formData.get('appointmentDate'),
			appointmentTime: formData.get('appointmentTime')
		});

		if (!parsed.success) {
			const fieldErrors = parsed.error.flatten().fieldErrors as BookingFieldErrors;
			return fail(400, {
				createForm: true,
				fieldErrors,
				message: 'Please fix the form.',
				week
			});
		}

		const { clientName, clientEmail, clientPhone, serviceName, appointmentDate, appointmentTime } =
			parsed.data;

		const startsAtDate = wallClockToDate(appointmentDate, appointmentTime, timeZone);
		if (Number.isNaN(startsAtDate.getTime())) {
			return fail(400, {
				createForm: true,
				message: 'Invalid date.',
				fieldErrors: {} as BookingFieldErrors,
				week
			});
		}

		if (startsAtDate <= new Date()) {
			return fail(400, {
				createForm: true,
				message: 'Appointment must be in the future.',
				fieldErrors: {} as BookingFieldErrors,
				week
			});
		}

		const upcomingForSlots = await db
			.select()
			.from(appointment)
			.where(
				and(
					eq(appointment.status, AppointmentStatus.Upcoming),
					gte(appointment.startsAt, new Date()),
					lt(
						appointment.startsAt,
						new Date(Date.now() + UPCOMING_WINDOW_DAYS * MS_PER_DAY)
					)
				)
			);

		if (!isSlotAvailable(startsAtDate, upcomingForSlots)) {
			return fail(400, {
				createForm: true,
				message: 'That time is no longer available. Pick another slot.',
				fieldErrors: {} as BookingFieldErrors,
				week
			});
		}

		const [inserted] = await db
			.insert(appointment)
			.values({
				clientName,
				clientEmail,
				clientPhone: clientPhone ?? null,
				startsAt: startsAtDate,
				serviceName,
				isConfirmed: false,
				reminderSentAt: null,
				status: AppointmentStatus.Upcoming
			})
			.returning();

		if (!inserted) {
			return fail(500, {
				createForm: true,
				message: 'Could not create appointment.',
				fieldErrors: {} as BookingFieldErrors,
				week
			});
		}

		try {
			await sendBookingConfirmation({
				to: clientEmail,
				clientName,
				startsAt: startsAtDate
			});
		} catch (err) {
			console.error('Confirmation email failed', err);
		}

		const targetWeek = formatWeekParam(getWeekMondayKeyFromDate(startsAtDate, timeZone));
		throw redirect(303, `/dashboard?week=${targetWeek}`);
	},

	sendReminder: async ({ request, url }) => {
		const timeZone = getBusinessTimezone();
		const formData = await request.formData();
		const appointmentId = formData.get('appointmentId');
		const week = weekFromForm(formData, url, timeZone);

		if (typeof appointmentId !== 'string' || appointmentId === '') {
			return fail(400, { message: 'Missing appointment.' });
		}

		const [row] = await db
			.select()
			.from(appointment)
			.where(eq(appointment.id, appointmentId))
			.limit(1);

		if (!row) {
			return fail(404, { message: 'Appointment not found.' });
		}

		if (row.status === AppointmentStatus.Cancelled) {
			return fail(400, { message: 'Cannot send reminder for a cancelled appointment.' });
		}

		if (row.reminderSentAt) {
			throw redirect(303, `/dashboard?week=${week}`);
		}

		if (!canSendAppointmentReminder(row)) {
			return fail(400, {
				message: 'Reminders can only be sent when the appointment status is Send reminder.'
			});
		}

		await sendAppointmentReminder({
			to: row.clientEmail,
			clientName: row.clientName,
			startsAt: row.startsAt,
			confirmUrl: getConfirmUrl(row.id, url.origin)
		});

		await db
			.update(appointment)
			.set({ reminderSentAt: new Date() })
			.where(eq(appointment.id, appointmentId));

		throw redirect(303, `/dashboard?week=${week}`);
	},

	signOut: async (event) => {
		await auth.api.signOut({
			headers: event.request.headers
		});
		throw redirect(302, '/book');
	}
};
