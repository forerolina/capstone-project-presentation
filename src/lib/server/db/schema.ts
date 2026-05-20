import { pgTable, boolean, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import type { AppointmentStatus } from '$lib/server/appointment/status';

export const appointment = pgTable('appointment', {
	id: uuid('id').primaryKey().defaultRandom(),
	clientName: text('client_name').notNull(),
	clientEmail: text('client_email').notNull(),
	clientPhone: text('client_phone'),
	startsAt: timestamp('starts_at', { withTimezone: true }).notNull(),
	serviceName: text('service_name').notNull(),
	isConfirmed: boolean('is_confirmed').notNull().default(false),
	reminderSentAt: timestamp('reminder_sent_at', { withTimezone: true }),
	status: text('status').notNull().$type<AppointmentStatus>(),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});

export * from './auth.schema';
