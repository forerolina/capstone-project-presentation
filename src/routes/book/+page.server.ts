import { fail, redirect } from '@sveltejs/kit';
import { and, asc, eq, gte, lt } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { wallClockToDate } from '$lib/calendar/datetime';
import { isWorkingDay } from '$lib/calendar/week';
import { isSlotAvailable } from '$lib/server/appointment/slots';
import { AppointmentStatus } from '$lib/server/appointment/status';
import { getBusinessTimezone } from '$lib/server/calendar/timezone';
import { bookingFormSchema, type BookingFieldErrors } from '$lib/server/booking/schema';
import { db } from '$lib/server/db';
import { appointment } from '$lib/server/db/schema';
import { sendBookingConfirmation } from '$lib/server/email';
import { getServiceById, listServices } from '$lib/server/service';

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const UPCOMING_WINDOW_DAYS = 90;

export const load: PageServerLoad = async ({ locals }) => {
	const timeZone = getBusinessTimezone();

	const [upcomingAppointments, services] = await Promise.all([
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
			.orderBy(asc(appointment.startsAt)),
		listServices()
	]);

	return {
		services,
		businessTimezone: timeZone,
		upcomingAppointments,
		isOwner: Boolean(locals.user)
	};
};

export const actions: Actions = {
	default: async ({ request }) => {
		const formData = await request.formData();
		const phoneRaw = formData.get('clientPhone');
		const timeZone = getBusinessTimezone();

		const parsed = bookingFormSchema.safeParse({
			clientName: formData.get('clientName'),
			clientEmail: formData.get('clientEmail'),
			clientPhone: typeof phoneRaw === 'string' && phoneRaw.trim() !== '' ? phoneRaw : undefined,
			serviceId: formData.get('serviceId'),
			appointmentDate: formData.get('appointmentDate'),
			appointmentTime: formData.get('appointmentTime')
		});

		if (!parsed.success) {
			const fieldErrors = parsed.error.flatten().fieldErrors as BookingFieldErrors;
			return fail(400, { fieldErrors, message: 'Please fix the form.' });
		}

		const { clientName, clientEmail, clientPhone, serviceId, appointmentDate, appointmentTime } =
			parsed.data;

		const selectedService = await getServiceById(serviceId);
		if (!selectedService) {
			return fail(400, {
				message: 'Please choose a valid service.',
				fieldErrors: { serviceId: ['Please choose a service'] } as BookingFieldErrors
			});
		}

		if (!isWorkingDay(appointmentDate)) {
			return fail(400, {
				message: 'Appointments are only available Monday–Friday.',
				fieldErrors: { appointmentDate: ['Choose a weekday.'] } as BookingFieldErrors
			});
		}

		const startsAtDate = wallClockToDate(appointmentDate, appointmentTime, timeZone);
		if (Number.isNaN(startsAtDate.getTime())) {
			return fail(400, { message: 'Invalid date.', fieldErrors: {} as BookingFieldErrors });
		}
		if (startsAtDate <= new Date()) {
			return fail(400, {
				message: 'Appointment must be in the future.',
				fieldErrors: {} as BookingFieldErrors
			});
		}

		const upcomingForSlots = await db
			.select()
			.from(appointment)
			.where(
				and(
					eq(appointment.status, AppointmentStatus.Upcoming),
					gte(appointment.startsAt, new Date()),
					lt(appointment.startsAt, new Date(Date.now() + UPCOMING_WINDOW_DAYS * MS_PER_DAY))
				)
			);

		if (
			!isSlotAvailable(
				startsAtDate,
				selectedService.durationMinutes,
				upcomingForSlots,
				undefined
			)
		) {
			return fail(400, {
				message: 'That time is no longer available. Pick another slot.',
				fieldErrors: {} as BookingFieldErrors
			});
		}

		const [inserted] = await db
			.insert(appointment)
			.values({
				clientName,
				clientEmail,
				clientPhone: clientPhone ?? null,
				startsAt: startsAtDate,
				serviceId: selectedService.id,
				serviceName: selectedService.name,
				durationMinutes: selectedService.durationMinutes,
				isConfirmed: false,
				reminderSentAt: null,
				status: AppointmentStatus.Upcoming
			})
			.returning();

		if (!inserted) {
			return fail(500, {
				message: 'Could not create booking.',
				fieldErrors: {} as BookingFieldErrors
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

		throw redirect(303, `/book/success?id=${inserted.id}`);
	}
};
