import { describe, expect, it } from 'vitest';
import {
	dateKeyFromDate,
	datetimeLocalToDate,
	timeKeyFromDate,
	wallClockToDate
} from './datetime';

const BOGOTA = 'America/Bogota';

describe('wall-clock datetime', () => {
	it('wallClockToDate stores noon Bogotá as 17:00 UTC', () => {
		const instant = wallClockToDate('2026-05-20', '12:00', BOGOTA);
		expect(instant.toISOString()).toBe('2026-05-20T17:00:00.000Z');
	});

	it('dateKeyFromDate uses business timezone, not UTC', () => {
		const instant = new Date('2026-05-20T02:00:00.000Z');
		expect(dateKeyFromDate(instant, BOGOTA)).toBe('2026-05-19');
		expect(dateKeyFromDate(instant, 'UTC')).toBe('2026-05-20');
	});

	it('datetimeLocalToDate parses form value in business timezone', () => {
		const instant = datetimeLocalToDate('2026-05-20T12:00', BOGOTA);
		expect(instant?.toISOString()).toBe('2026-05-20T17:00:00.000Z');
	});

	it('round-trips wall clock parts', () => {
		const instant = wallClockToDate('2026-05-20', '10:00', BOGOTA);
		expect(dateKeyFromDate(instant, BOGOTA)).toBe('2026-05-20');
		expect(timeKeyFromDate(instant, BOGOTA)).toBe('10:00');
	});
});
