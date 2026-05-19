import {
	addDaysToDateKey,
	dateKeyFromDate,
	type DateKey,
	wallClockToDate
} from '$lib/calendar/datetime';

export type { DateKey };

export function weekdayFromDateKey(dateKey: DateKey): number {
	const [year, month, day] = dateKey.split('-').map(Number);
	return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

/** Monday date key (YYYY-MM-DD) for the week containing `dateKey`. */
export function getWeekMondayKey(dateKey: DateKey): DateKey {
	const weekday = weekdayFromDateKey(dateKey);
	const daysFromMonday = weekday === 0 ? 6 : weekday - 1;
	return addDaysToDateKey(dateKey, -daysFromMonday);
}

export function getWeekMondayKeyFromDate(date: Date, timeZone: string): DateKey {
	return getWeekMondayKey(dateKeyFromDate(date, timeZone));
}

export function getWeekRange(
	mondayKey: DateKey,
	timeZone: string
): { start: Date; end: Date } {
	const start = wallClockToDate(mondayKey, '00:00', timeZone);
	const end = wallClockToDate(addDaysToDateKey(mondayKey, 7), '00:00', timeZone);
	return { start, end };
}

export function getWeekDayKeys(mondayKey: DateKey): DateKey[] {
	return Array.from({ length: 7 }, (_, i) => addDaysToDateKey(mondayKey, i));
}

export function formatWeekLabel(mondayKey: DateKey, timeZone: string): string {
	const days = getWeekDayKeys(mondayKey);
	const start = wallClockToDate(days[0], '12:00', timeZone);
	const end = wallClockToDate(days[6], '12:00', timeZone);
	const sameMonth = days[0].slice(0, 7) === days[6].slice(0, 7);
	const startStr = start.toLocaleDateString(undefined, {
		timeZone,
		month: 'short',
		day: 'numeric',
		...(sameMonth ? {} : { year: 'numeric' })
	});
	const endStr = end.toLocaleDateString(undefined, {
		timeZone,
		month: 'short',
		day: 'numeric',
		year: 'numeric'
	});
	return `${startStr} – ${endStr}`;
}

export function parseWeekParam(value: string | null, timeZone: string): DateKey {
	if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value.trim())) {
		return getWeekMondayKeyFromDate(new Date(), timeZone);
	}
	return getWeekMondayKey(value.trim());
}

export function formatWeekParam(mondayKey: DateKey): DateKey {
	return mondayKey;
}

export function addWeeks(mondayKey: DateKey, weeks: number): DateKey {
	return addDaysToDateKey(mondayKey, weeks * 7);
}

export function isSameDateKey(instant: Date, dateKey: DateKey, timeZone: string): boolean {
	return dateKeyFromDate(instant, timeZone) === dateKey;
}

export function dayKeyFromDateKey(dateKey: DateKey): DateKey {
	return dateKey;
}

export function dayOfMonthFromDateKey(dateKey: DateKey): number {
	return Number(dateKey.split('-')[2]);
}

/** @deprecated Use isSameDateKey with a business timezone. */
export function isSameLocalDay(a: Date, b: Date): boolean {
	return (
		a.getFullYear() === b.getFullYear() &&
		a.getMonth() === b.getMonth() &&
		a.getDate() === b.getDate()
	);
}

/** @deprecated Use getWeekMondayKeyFromDate. */
export function getWeekMonday(date: Date): Date {
	const key = getWeekMondayKeyFromDate(date, 'UTC');
	return wallClockToDate(key, '00:00', 'UTC');
}

/** @deprecated Use getWeekDayKeys. */
export function getWeekDays(monday: Date): Date[] {
	const mondayKey = dateKeyFromDate(monday, 'UTC');
	return getWeekDayKeys(mondayKey).map((k) => wallClockToDate(k, '00:00', 'UTC'));
}

/** @deprecated Use dayKeyFromDate / dateKeyFromDate. */
export function dayKey(date: Date): string {
	return dateKeyFromDate(date, 'UTC');
}
