import { pgTable, boolean, integer, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import type { AppointmentStatus } from '$lib/server/appointment/status';

export const appointment = pgTable('appointment', {
	id: uuid('id').primaryKey().defaultRandom(),
	clientName: text('client_name').notNull(),
	clientEmail: text('client_email').notNull(),
	clientPhone: text('client_phone'),
	startsAt: timestamp('starts_at', { withTimezone: true }).notNull(),
	serviceName: text('service_name').notNull(),
	isConfirmed: boolean('is_confirmed').notNull().default(true),
	reminderSentAt: timestamp('reminder_sent_at', { withTimezone: true }),
	status: text('status').notNull().$type<AppointmentStatus>(),
	stripeCheckoutSessionId: text('stripe_checkout_session_id').unique(),
	stripePaymentIntentId: text('stripe_payment_intent_id'),
	amountCents: integer('amount_cents'),
	currency: text('currency').default('usd'),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});

export * from './auth.schema';
