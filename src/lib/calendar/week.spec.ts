import { describe, expect, it } from 'vitest';
import {
	addWeeks,
	formatWeekParam,
	getWeekMonday,
	getWeekRange,
	isSameLocalDay,
	parseWeekParam
} from './week';

describe('week calendar helpers', () => {
	it('getWeekMonday returns Monday for a Wednesday', () => {
		const wed = new Date(2026, 4, 13);
		const monday = getWeekMonday(wed);
		expect(monday.getDay()).toBe(1);
		expect(monday.getDate()).toBe(11);
	});

	it('getWeekRange spans seven days', () => {
		const monday = new Date(2026, 4, 12);
		const { start, end } = getWeekRange(monday);
		expect(end.getTime() - start.getTime()).toBe(7 * 24 * 60 * 60 * 1000);
	});

	it('parseWeekParam normalizes to that week’s Monday', () => {
		const monday = parseWeekParam('2026-05-13');
		expect(formatWeekParam(monday)).toBe('2026-05-11');
	});

	it('addWeeks shifts by seven days', () => {
		const monday = new Date(2026, 4, 12);
		const next = addWeeks(monday, 1);
		expect(formatWeekParam(next)).toBe('2026-05-19');
	});

	it('isSameLocalDay compares calendar days', () => {
		const a = new Date(2026, 4, 12, 9, 0);
		const b = new Date(2026, 4, 12, 17, 30);
		expect(isSameLocalDay(a, b)).toBe(true);
	});
});
