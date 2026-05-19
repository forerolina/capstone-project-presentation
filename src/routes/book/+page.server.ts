import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { datetimeLocalToDate } from '$lib/calendar/datetime';
import { BOOKING_SERVICES } from '$lib/booking/services';
import { AppointmentStatus } from '$lib/server/appointment/status';
import { getBusinessTimezone } from '$lib/server/calendar/timezone';
import { bookingFormSchema, type BookingFieldErrors } from '$lib/server/booking/schema';
import { db } from '$lib/server/db';
import { appointment } from '$lib/server/db/schema';
import { sendBookingConfirmation } from '$lib/server/email';

export const load: PageServerLoad = async () => {
	return { services: [...BOOKING_SERVICES] };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const formData = await request.formData();
		const phoneRaw = formData.get('clientPhone');
		const parsed = bookingFormSchema.safeParse({
			clientName: formData.get('clientName'),
			clientEmail: formData.get('clientEmail'),
			clientPhone: typeof phoneRaw === 'string' && phoneRaw.trim() !== '' ? phoneRaw : undefined,
			serviceName: formData.get('serviceName'),
			startsAt: formData.get('startsAt')
		});

		if (!parsed.success) {
			const fieldErrors = parsed.error.flatten().fieldErrors as BookingFieldErrors;
			return fail(400, { fieldErrors, message: 'Please fix the form.' });
		}

		const { clientName, clientEmail, clientPhone, serviceName, startsAt } = parsed.data;
		const timeZone = getBusinessTimezone();
		const startsAtDate = datetimeLocalToDate(startsAt, timeZone);
		if (!startsAtDate || Number.isNaN(startsAtDate.getTime())) {
			return fail(400, { message: 'Invalid date.', fieldErrors: {} as BookingFieldErrors });
		}
		if (startsAtDate <= new Date()) {
			return fail(400, {
				message: 'Appointment must be in the future.',
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
				serviceName,
				isConfirmed: true,
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
