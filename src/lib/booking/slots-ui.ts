import {
	addDaysToDateKey,
	dateKeyFromDate,
	wallClockToDate,
	type DateKey
} from '$lib/calendar/datetime';
import { isWorkingDay, weekdayFromDateKey } from '$lib/calendar/week';
import type { AppointmentRow } from '$lib/components/AppointmentCard.svelte';

export const MS_PER_MINUTE = 60 * 1000;
export const SLOT_GRID_MINUTES = 15;
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
	slotDurationMinutes: number,
	excludeId?: string
): Date[] {
	if (!isWorkingDay(dayKey)) return [];

	const now = new Date();
	const slots: Date[] = [];
	const dayStartMinutes = CALENDAR_START * 60;
	const dayEndMinutes = CALENDAR_END * 60;

	for (let minutes = dayStartMinutes; minutes < dayEndMinutes; minutes += SLOT_GRID_MINUTES) {
		const hour = Math.floor(minutes / 60);
		const minute = minutes % 60;
		const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
		const slot = wallClockToDate(dayKey, time, businessTimezone);
		if (slot <= now) continue;

		const slotEnd = new Date(slot.getTime() + slotDurationMinutes * MS_PER_MINUTE);
		const slotEndMinutes = minutes + slotDurationMinutes;
		if (slotEndMinutes > dayEndMinutes) continue;

		const hasConflict = appointments.some((appt) => {
			if (excludeId && appt.id === excludeId) return false;
			if (appt.status !== 'upcoming') return false;
			const apptStart = asDate(appt.startsAt);
			const apptDuration = appt.durationMinutes ?? 60;
			const apptEnd = new Date(apptStart.getTime() + apptDuration * MS_PER_MINUTE);
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
