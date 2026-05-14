import { pgTable, serial, integer, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const task = pgTable('task', {
	id: serial('id').primaryKey(),
	title: text('title').notNull(),
	priority: integer('priority').notNull().default(1)
});

export const appointment = pgTable('appointment', {
	id: uuid('id').primaryKey().defaultRandom(),
	clientName: text('client_name').notNull(),
	clientEmail: text('client_email').notNull(),
	clientPhone: text('client_phone'),
	startsAt: timestamp('starts_at', { withTimezone: true }).notNull(),
	status: text('status').notNull().$type<'awaiting_payment' | 'confirmed'>(),
	stripeCheckoutSessionId: text('stripe_checkout_session_id').unique(),
	stripePaymentIntentId: text('stripe_payment_intent_id'),
	amountCents: integer('amount_cents').notNull(),
	currency: text('currency').notNull().default('usd'),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});

export * from './auth.schema';
