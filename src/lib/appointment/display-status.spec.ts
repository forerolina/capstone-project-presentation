import { describe, expect, it } from 'vitest';
import {
	canSendAppointmentReminder,
	getAppointmentDisplayStatus,
	isWithin24Hours,
	MS_24H
} from './display-status';

const base = {
	status: 'upcoming',
	reminderSentAt: null as Date | null,
	isConfirmed: false
};

describe('isWithin24Hours', () => {
	it('is false when appointment is more than 24h away', () => {
		const now = new Date('2026-05-19T12:00:00Z');
		const startsAt = new Date(now.getTime() + MS_24H + 1);
		expect(isWithin24Hours(startsAt, now)).toBe(false);
	});

	it('is true when appointment is exactly 24h away', () => {
		const now = new Date('2026-05-19T12:00:00Z');
		const startsAt = new Date(now.getTime() + MS_24H);
		expect(isWithin24Hours(startsAt, now)).toBe(true);
	});

	it('is false when appointment is in the past', () => {
		const now = new Date('2026-05-19T12:00:00Z');
		const startsAt = new Date(now.getTime() - 1000);
		expect(isWithin24Hours(startsAt, now)).toBe(false);
	});
});

describe('getAppointmentDisplayStatus', () => {
	const now = new Date('2026-05-19T12:00:00Z');

	it('returns Cancelled when status is cancelled', () => {
		expect(
			getAppointmentDisplayStatus(
				{ ...base, status: 'cancelled', startsAt: new Date(now.getTime() + MS_24H * 2) },
				now
			)
		).toEqual({ label: 'Cancelled', variant: 'cancelled' });
	});

	it('returns Scheduled when more than 24h away', () => {
		expect(
			getAppointmentDisplayStatus(
				{ ...base, startsAt: new Date(now.getTime() + MS_24H + 1) },
				now
			)
		).toEqual({ label: 'Scheduled', variant: 'scheduled' });
	});

	it('returns Send reminder within 24h before reminder sent', () => {
		expect(
			getAppointmentDisplayStatus(
				{ ...base, startsAt: new Date(now.getTime() + MS_24H) },
				now
			)
		).toEqual({ label: 'Send reminder', variant: 'reminder' });
	});

	it('returns Pending when reminder sent and not confirmed', () => {
		expect(
			getAppointmentDisplayStatus(
				{
					...base,
					startsAt: new Date(now.getTime() + MS_24H),
					reminderSentAt: new Date(now.getTime() - 1000)
				},
				now
			)
		).toEqual({ label: 'Pending', variant: 'pending' });
	});

	it('returns Confirmed when reminder sent and confirmed', () => {
		expect(
			getAppointmentDisplayStatus(
				{
					...base,
					startsAt: new Date(now.getTime() + MS_24H),
					reminderSentAt: new Date(now.getTime() - 1000),
					isConfirmed: true
				},
				now
			)
		).toEqual({ label: 'Confirmed', variant: 'confirmed' });
	});

	it('returns Scheduled when more than 24h away even if reminder was sent early', () => {
		expect(
			getAppointmentDisplayStatus(
				{
					...base,
					startsAt: new Date(now.getTime() + MS_24H * 3),
					reminderSentAt: new Date(now.getTime() - 1000)
				},
				now
			)
		).toEqual({ label: 'Scheduled', variant: 'scheduled' });
	});
});

describe('canSendAppointmentReminder', () => {
	const now = new Date('2026-05-19T12:00:00Z');

	it('is false when more than 24h away', () => {
		expect(
			canSendAppointmentReminder(
				{ ...base, startsAt: new Date(now.getTime() + MS_24H + 1) },
				now
			)
		).toBe(false);
	});

	it('is true within 24h and no reminder sent', () => {
		expect(
			canSendAppointmentReminder(
				{ ...base, startsAt: new Date(now.getTime() + MS_24H) },
				now
			)
		).toBe(true);
	});

	it('is false after reminder sent', () => {
		expect(
			canSendAppointmentReminder(
				{
					...base,
					startsAt: new Date(now.getTime() + MS_24H),
					reminderSentAt: new Date()
				},
				now
			)
		).toBe(false);
	});
});
