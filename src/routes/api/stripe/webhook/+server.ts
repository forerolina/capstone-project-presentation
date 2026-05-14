import type { RequestHandler } from '@sveltejs/kit';
import Stripe from 'stripe';
import { eq } from 'drizzle-orm';
import { env } from '$env/dynamic/private';
import { sendBookingConfirmation } from '$lib/server/email';
import { db } from '$lib/server/db';
import { appointment } from '$lib/server/db/schema';
import { getStripe } from '$lib/server/stripe';

export const config = {
	csrf: { checkOrigin: false }
};

export const POST: RequestHandler = async ({ request }) => {
	const secret = env.STRIPE_WEBHOOK_SECRET;
	if (!secret) {
		console.error('STRIPE_WEBHOOK_SECRET is not set');
		return new Response('Misconfigured', { status: 500 });
	}

	const stripe = getStripe();
	const signature = request.headers.get('stripe-signature');
	const body = await request.text();

	if (!signature) {
		return new Response('Missing signature', { status: 400 });
	}

	let event: Stripe.Event;
	try {
		event = stripe.webhooks.constructEvent(body, signature, secret);
	} catch (err) {
		console.error(err);
		return new Response('Webhook signature verification failed', { status: 400 });
	}

	if (event.type !== 'checkout.session.completed') {
		return new Response('OK', { status: 200 });
	}

	const session = event.data.object as Stripe.Checkout.Session;
	const sessionId = session.id;

	const [row] = await db
		.select()
		.from(appointment)
		.where(eq(appointment.stripeCheckoutSessionId, sessionId))
		.limit(1);

	if (!row) {
		console.warn('No appointment for checkout session', sessionId);
		return new Response('OK', { status: 200 });
	}

	if (row.status === 'confirmed') {
		return new Response('OK', { status: 200 });
	}

	const paymentIntentId =
		typeof session.payment_intent === 'string'
			? session.payment_intent
			: (session.payment_intent?.id ?? null);

	await db
		.update(appointment)
		.set({
			status: 'confirmed',
			stripePaymentIntentId: paymentIntentId
		})
		.where(eq(appointment.id, row.id));

	try {
		await sendBookingConfirmation({
			to: row.clientEmail,
			clientName: row.clientName,
			startsAt: row.startsAt,
			amountCents: row.amountCents,
			currency: row.currency
		});
	} catch (err) {
		console.error('Confirmation email failed', err);
		return new Response('Email delivery failed', { status: 500 });
	}

	return new Response('OK', { status: 200 });
};
