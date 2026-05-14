import { fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { env } from '$env/dynamic/private';
import { bookingFormSchema, type BookingFieldErrors } from '$lib/server/booking/schema';
import { db } from '$lib/server/db';
import { appointment } from '$lib/server/db/schema';
import { getStripe } from '$lib/server/stripe';

export const load: PageServerLoad = async () => {
	return {};
};

export const actions: Actions = {
	default: async ({ request }) => {
		const formData = await request.formData();
		const phoneRaw = formData.get('clientPhone');
		const parsed = bookingFormSchema.safeParse({
			clientName: formData.get('clientName'),
			clientEmail: formData.get('clientEmail'),
			clientPhone: typeof phoneRaw === 'string' && phoneRaw.trim() !== '' ? phoneRaw : undefined,
			startsAt: formData.get('startsAt')
		});

		if (!parsed.success) {
			const fieldErrors = parsed.error.flatten().fieldErrors as BookingFieldErrors;
			return fail(400, { fieldErrors, message: 'Please fix the form.' });
		}

		const { clientName, clientEmail, clientPhone, startsAt } = parsed.data;
		const startsAtDate = new Date(startsAt);
		if (Number.isNaN(startsAtDate.getTime())) {
			return fail(400, { message: 'Invalid date.', fieldErrors: {} as BookingFieldErrors });
		}
		if (startsAtDate <= new Date()) {
			return fail(400, {
				message: 'Appointment must be in the future.',
				fieldErrors: {} as BookingFieldErrors
			});
		}

		const origin = env.ORIGIN?.replace(/\/$/, '');
		const priceId = env.STRIPE_APPOINTMENT_PRICE_ID;
		if (!origin || !priceId) {
			console.error('Missing ORIGIN or STRIPE_APPOINTMENT_PRICE_ID');
			return fail(500, { message: 'Server misconfigured.', fieldErrors: {} as BookingFieldErrors });
		}

		const stripe = getStripe();
		let price: Awaited<ReturnType<typeof stripe.prices.retrieve>>;
		try {
			price = await stripe.prices.retrieve(priceId);
		} catch (e) {
			console.error(e);
			return fail(500, {
				message: 'Could not load pricing.',
				fieldErrors: {} as BookingFieldErrors
			});
		}

		const unitAmount = price.unit_amount;
		const currency = (price.currency || 'usd').toLowerCase();
		if (unitAmount == null) {
			return fail(500, {
				message: 'Invalid price configuration.',
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
				status: 'awaiting_payment',
				amountCents: unitAmount,
				currency
			})
			.returning();

		if (!inserted) {
			return fail(500, {
				message: 'Could not create booking.',
				fieldErrors: {} as BookingFieldErrors
			});
		}

		let session: Awaited<ReturnType<typeof stripe.checkout.sessions.create>>;
		try {
			session = await stripe.checkout.sessions.create({
				mode: 'payment',
				customer_email: clientEmail,
				line_items: [{ price: priceId, quantity: 1 }],
				success_url: `${origin}/book/success?session_id={CHECKOUT_SESSION_ID}`,
				cancel_url: `${origin}/book`,
				metadata: { appointmentId: inserted.id }
			});
		} catch (e) {
			console.error(e);
			await db.delete(appointment).where(eq(appointment.id, inserted.id));
			return fail(500, {
				message: 'Could not start checkout. Try again.',
				fieldErrors: {} as BookingFieldErrors
			});
		}

		if (!session.url) {
			await db.delete(appointment).where(eq(appointment.id, inserted.id));
			return fail(500, { message: 'Checkout URL missing.', fieldErrors: {} as BookingFieldErrors });
		}

		await db
			.update(appointment)
			.set({ stripeCheckoutSessionId: session.id })
			.where(eq(appointment.id, inserted.id));

		throw redirect(303, session.url);
	}
};
