export type DateKey = string;

export interface WallClockParts {
	year: number;
	month: number;
	day: number;
	hour: number;
	minute: number;
	second: number;
}

const wallClockFormatterCache = new Map<string, Intl.DateTimeFormat>();

function getWallClockFormatter(timeZone: string): Intl.DateTimeFormat {
	let formatter = wallClockFormatterCache.get(timeZone);
	if (!formatter) {
		formatter = new Intl.DateTimeFormat('en-CA', {
			timeZone,
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit',
			hour12: false
		});
		wallClockFormatterCache.set(timeZone, formatter);
	}
	return formatter;
}

export function getWallClockParts(date: Date, timeZone: string): WallClockParts {
	const parts = getWallClockFormatter(timeZone).formatToParts(date);
	const values: Record<string, string> = {};
	for (const part of parts) {
		if (part.type !== 'literal') values[part.type] = part.value;
	}
	return {
		year: Number(values.year),
		month: Number(values.month),
		day: Number(values.day),
		hour: Number(values.hour),
		minute: Number(values.minute),
		second: Number(values.second ?? 0)
	};
}

export function formatDateKey(year: number, month: number, day: number): DateKey {
	return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/** Add calendar days to a date key (YYYY-MM-DD). */
export function addDaysToDateKey(dateKey: DateKey, days: number): DateKey {
	const [year, month, day] = dateKey.split('-').map(Number);
	const shifted = new Date(Date.UTC(year, month - 1, day + days));
	return formatDateKey(shifted.getUTCFullYear(), shifted.getUTCMonth() + 1, shifted.getUTCDate());
}

function formatTimeKey(hour: number, minute: number): string {
	return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

/** Calendar date (YYYY-MM-DD) for an instant in the given timezone. */
export function dateKeyFromDate(date: Date, timeZone: string): DateKey {
	const p = getWallClockParts(date, timeZone);
	return formatDateKey(p.year, p.month, p.day);
}

/** Wall-clock time (HH:mm) for an instant in the given timezone. */
export function timeKeyFromDate(date: Date, timeZone: string): string {
	const p = getWallClockParts(date, timeZone);
	return formatTimeKey(p.hour, p.minute);
}

/**
 * Build a UTC instant from a calendar date and time in `timeZone`.
 * The result always represents that wall clock, regardless of server/browser TZ.
 */
export function wallClockToDate(dateStr: string, timeStr: string, timeZone: string): Date {
	const [year, month, day] = dateStr.split('-').map(Number);
	const [hour, minute] = timeStr.split(':').map(Number);
	const targetMs = Date.UTC(year, month - 1, day, hour, minute, 0);

	let guess = targetMs;
	for (let i = 0; i < 5; i++) {
		const parts = getWallClockParts(new Date(guess), timeZone);
		const actualMs = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, 0);
		const diff = targetMs - actualMs;
		if (diff === 0) break;
		guess += diff;
	}
	return new Date(guess);
}

export function dateToWallClock(
	date: Date,
	timeZone: string
): { date: DateKey; time: string } {
	const p = getWallClockParts(date, timeZone);
	return {
		date: formatDateKey(p.year, p.month, p.day),
		time: formatTimeKey(p.hour, p.minute)
	};
}

/** Parse `<input type="datetime-local">` value as wall clock in `timeZone`. */
export function datetimeLocalToDate(value: string, timeZone: string): Date | null {
	const match = value.trim().match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/);
	if (!match) return null;
	return wallClockToDate(match[1], match[2], timeZone);
}

/** Value for `<input type="datetime-local">` from an instant in `timeZone`. */
export function toDatetimeLocalValue(date: Date, timeZone: string): string {
	const { date: dateKey, time } = dateToWallClock(date, timeZone);
	return `${dateKey}T${time}`;
}

export function toDateInputValue(date: Date, timeZone: string): string {
	return dateKeyFromDate(date, timeZone);
}

export function toTimeInputValue(date: Date, timeZone: string): string {
	return timeKeyFromDate(date, timeZone);
}

export function formatTimeInZone(date: Date, timeZone: string): string {
	return new Intl.DateTimeFormat(undefined, {
		timeZone,
		timeStyle: 'short'
	}).format(date);
}

export function formatDateTimeInZone(date: Date, timeZone: string): string {
	return new Intl.DateTimeFormat(undefined, {
		timeZone,
		dateStyle: 'full',
		timeStyle: 'short'
	}).format(date);
}

export function wallClockHour(date: Date, timeZone: string): number {
	return getWallClockParts(date, timeZone).hour;
}

export function wallClockMinute(date: Date, timeZone: string): number {
	return getWallClockParts(date, timeZone).minute;
}

/** @deprecated Use wallClockToDate with an explicit business timezone. */
export function fromDateAndTime(dateStr: string, timeStr: string): Date {
	return wallClockToDate(dateStr, timeStr, 'UTC');
}
