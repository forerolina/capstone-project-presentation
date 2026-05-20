import {
	addDaysToDateKey,
	dateKeyFromDate,
	wallClockToDate,
	type DateKey
} from '$lib/calendar/datetime';
import { weekdayFromDateKey } from '$lib/calendar/week';
import type { AppointmentRow } from '$lib/components/AppointmentCard.svelte';

export const MS_PER_HOUR = 60 * 60 * 1000;
export const CALENDAR_START = 8;
export const CALENDAR_END = 20;

export function monthStartKey(dateKey: DateKey): DateKey {
	return `${dateKey.slice(0, 7)}-01`;
}

export function asDate(value: Date | string): Date {
	return value instanceof Date ? value : new Date(value);
}

export function getMonthGridDayKeys(monthKey: DateKey): DateKey[] {
	const firstWeekday = weekdayFromDateKey(monthKey);
	const gridStart = addDaysToDateKey(monthKey, -firstWeekday);
	return Array.from({ length: 42 }, (_, i) => addDaysToDateKey(gridStart, i));
}

export function getAvailableSlots(
	dayKey: DateKey,
	appointments: AppointmentRow[],
	businessTimezone: string,
	excludeId?: string
): Date[] {
	const now = new Date();
	const slots: Date[] = [];

	for (let hour = CALENDAR_START; hour < CALENDAR_END; hour++) {
		const time = `${String(hour).padStart(2, '0')}:00`;
		const slot = wallClockToDate(dayKey, time, businessTimezone);
		if (slot <= now) continue;

		const slotEnd = new Date(slot.getTime() + MS_PER_HOUR);
		const hasConflict = appointments.some((appt) => {
			if (excludeId && appt.id === excludeId) return false;
			if (appt.status !== 'upcoming') return false;
			const apptStart = asDate(appt.startsAt);
			const apptEnd = new Date(apptStart.getTime() + MS_PER_HOUR);
			return apptStart < slotEnd && apptEnd > slot;
		});
		if (!hasConflict) slots.push(slot);
	}

	return slots;
}

export function shiftMonthKey(viewMonthKey: DateKey, months: number): DateKey {
	const [year, month] = viewMonthKey.split('-').map(Number);
	const shifted = new Date(Date.UTC(year, month - 1 + months, 1));
	return `${shifted.getUTCFullYear()}-${String(shifted.getUTCMonth() + 1).padStart(2, '0')}-01`;
}

export function todayKeyInZone(businessTimezone: string): DateKey {
	return dateKeyFromDate(new Date(), businessTimezone);
}
