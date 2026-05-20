import { describe, expect, it } from 'vitest';
import { wallClockToDate } from './datetime';
import {
	addWeeks,
	formatWeekParam,
	getWeekMondayKey,
	getWeekRange,
	isSameDateKey,
	isWorkingDay,
	nextWorkingDayKey,
	parseWeekParam
} from './week';

const TZ = 'UTC';

describe('week calendar helpers', () => {
	it('getWeekMondayKey returns Monday for a Wednesday', () => {
		expect(getWeekMondayKey('2026-05-13')).toBe('2026-05-11');
	});

	it('getWeekRange spans seven days in UTC', () => {
		const { start, end } = getWeekRange('2026-05-12', TZ);
		expect(end.getTime() - start.getTime()).toBe(7 * 24 * 60 * 60 * 1000);
		expect(start.toISOString()).toBe('2026-05-12T00:00:00.000Z');
	});

	it('parseWeekParam normalizes to that week’s Monday', () => {
		const monday = parseWeekParam('2026-05-13', TZ);
		expect(formatWeekParam(monday)).toBe('2026-05-11');
	});

	it('addWeeks shifts by seven days', () => {
		expect(addWeeks('2026-05-12', 1)).toBe('2026-05-19');
	});

	it('isSameDateKey compares calendar days in a timezone', () => {
		const morning = wallClockToDate('2026-05-12', '09:00', TZ);
		const evening = wallClockToDate('2026-05-12', '17:30', TZ);
		expect(isSameDateKey(morning, '2026-05-12', TZ)).toBe(true);
		expect(isSameDateKey(evening, '2026-05-12', TZ)).toBe(true);
	});

	it('isWorkingDay is true Monday–Friday and false on weekends', () => {
		expect(isWorkingDay('2026-05-11')).toBe(true); // Monday
		expect(isWorkingDay('2026-05-15')).toBe(true); // Friday
		expect(isWorkingDay('2026-05-16')).toBe(false); // Saturday
		expect(isWorkingDay('2026-05-17')).toBe(false); // Sunday
	});

	it('nextWorkingDayKey advances from Saturday to Monday', () => {
		expect(nextWorkingDayKey('2026-05-16')).toBe('2026-05-18');
	});
});
