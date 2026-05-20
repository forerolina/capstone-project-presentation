export const MS_24H = 24 * 60 * 60 * 1000;

export type DisplayStatusVariant =
	| 'scheduled'
	| 'reminder'
	| 'pending'
	| 'confirmed'
	| 'cancelled';

export interface AppointmentDisplayInput {
	status: string;
	startsAt: Date | string;
	reminderSentAt: Date | string | null;
	isConfirmed: boolean;
}

export interface AppointmentDisplayStatus {
	label: string;
	variant: DisplayStatusVariant;
}

function asDate(value: Date | string): Date {
	return value instanceof Date ? value : new Date(value);
}

export function isWithin24Hours(startsAt: Date | string, now = new Date()): boolean {
	const msUntil = asDate(startsAt).getTime() - now.getTime();
	return msUntil > 0 && msUntil <= MS_24H;
}

function hasReminderBeenSent(appt: AppointmentDisplayInput): boolean {
	const { reminderSentAt } = appt;
	if (reminderSentAt == null) return false;
	if (typeof reminderSentAt === 'string' && reminderSentAt.trim() === '') return false;
	return true;
}

export function getAppointmentDisplayStatus(
	appt: AppointmentDisplayInput,
	now = new Date()
): AppointmentDisplayStatus {
	if (appt.status === 'cancelled') {
		return { label: 'Cancelled', variant: 'cancelled' };
	}

	if (!isWithin24Hours(appt.startsAt, now)) {
		return { label: 'Scheduled', variant: 'scheduled' };
	}

	if (!hasReminderBeenSent(appt)) {
		return { label: 'Send reminder', variant: 'reminder' };
	}

	if (appt.isConfirmed) {
		return { label: 'Confirmed', variant: 'confirmed' };
	}

	return { label: 'Pending', variant: 'pending' };
}

export function getDisplayStatusAccentColor(variant: DisplayStatusVariant): string {
	switch (variant) {
		case 'scheduled':
			return 'var(--status-scheduled)';
		case 'reminder':
			return 'var(--status-reminder)';
		case 'pending':
			return 'var(--status-pending)';
		case 'confirmed':
			return 'var(--status-confirmed)';
		case 'cancelled':
			return 'var(--status-cancelled)';
	}
}

export function canSendAppointmentReminder(
	appt: AppointmentDisplayInput,
	now = new Date()
): boolean {
	return getAppointmentDisplayStatus(appt, now).variant === 'reminder';
}
