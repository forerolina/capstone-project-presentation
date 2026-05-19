const MS_PER_DAY = 24 * 60 * 60 * 1000;

function startOfLocalDay(date: Date): Date {
	return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Monday 00:00 local time for the week containing `date`. */
export function getWeekMonday(date: Date): Date {
	const day = startOfLocalDay(date);
	const weekday = day.getDay();
	const daysFromMonday = weekday === 0 ? 6 : weekday - 1;
	return new Date(day.getTime() - daysFromMonday * MS_PER_DAY);
}

export function getWeekRange(monday: Date): { start: Date; end: Date } {
	const start = startOfLocalDay(monday);
	const end = new Date(start.getTime() + 7 * MS_PER_DAY);
	return { start, end };
}

export function getWeekDays(monday: Date): Date[] {
	const start = startOfLocalDay(monday);
	return Array.from({ length: 7 }, (_, i) => new Date(start.getTime() + i * MS_PER_DAY));
}

export function formatWeekLabel(monday: Date): string {
	const days = getWeekDays(monday);
	const start = days[0];
	const end = days[6];
	const sameMonth = start.getMonth() === end.getMonth();
	const startStr = start.toLocaleDateString(undefined, {
		month: 'short',
		day: 'numeric',
		...(sameMonth ? {} : { year: 'numeric' })
	});
	const endStr = end.toLocaleDateString(undefined, {
		month: 'short',
		day: 'numeric',
		year: 'numeric'
	});
	return `${startStr} – ${endStr}`;
}

export function parseWeekParam(value: string | null): Date {
	if (!value) return getWeekMonday(new Date());
	const parsed = new Date(`${value}T00:00:00`);
	if (Number.isNaN(parsed.getTime())) return getWeekMonday(new Date());
	return getWeekMonday(parsed);
}

export function formatWeekParam(monday: Date): string {
	const d = startOfLocalDay(monday);
	const y = d.getFullYear();
	const m = String(d.getMonth() + 1).padStart(2, '0');
	const day = String(d.getDate()).padStart(2, '0');
	return `${y}-${m}-${day}`;
}

export function addWeeks(monday: Date, weeks: number): Date {
	return new Date(startOfLocalDay(monday).getTime() + weeks * 7 * MS_PER_DAY);
}

export function isSameLocalDay(a: Date, b: Date): boolean {
	return (
		a.getFullYear() === b.getFullYear() &&
		a.getMonth() === b.getMonth() &&
		a.getDate() === b.getDate()
	);
}

export function dayKey(date: Date): string {
	const y = date.getFullYear();
	const m = String(date.getMonth() + 1).padStart(2, '0');
	const d = String(date.getDate()).padStart(2, '0');
	return `${y}-${m}-${d}`;
}
