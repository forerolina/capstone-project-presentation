import { describe, expect, it } from 'vitest';
import { wallClockToDate } from '$lib/calendar/datetime';
import { getAvailableSlots, groupSlotsByPeriod } from './slots-ui';

describe('getAvailableSlots', () => {
	it('returns no slots on weekends', () => {
		expect(getAvailableSlots('2026-05-16', [], 'UTC', 60)).toEqual([]);
		expect(getAvailableSlots('2026-05-17', [], 'UTC', 60)).toEqual([]);
	});

	it('omits slots that do not fit the service duration before closing', () => {
		const slots = getAvailableSlots('2026-06-15', [], 'UTC', 120);
		expect(slots.length).toBeGreaterThan(0);
		const lastSlot = slots[slots.length - 1];
		expect(lastSlot.getUTCHours()).toBe(18);
		expect(lastSlot.getUTCMinutes()).toBe(0);
	});
});

describe('groupSlotsByPeriod', () => {
	it('returns empty groups for empty input', () => {
		expect(groupSlotsByPeriod([], 'UTC')).toEqual({
			morning: [],
			afternoon: [],
			evening: []
		});
	});

	it('places slots into morning, afternoon, and evening buckets', () => {
		const dayKey = '2026-06-15';
		const grouped = groupSlotsByPeriod(
			[
				wallClockToDate(dayKey, '08:15', 'UTC'),
				wallClockToDate(dayKey, '12:00', 'UTC'),
				wallClockToDate(dayKey, '17:30', 'UTC')
			],
			'UTC'
		);

		expect(grouped.morning).toHaveLength(1);
		expect(grouped.afternoon).toHaveLength(1);
		expect(grouped.evening).toHaveLength(1);
		expect(grouped.morning[0].getUTCHours()).toBe(8);
		expect(grouped.morning[0].getUTCMinutes()).toBe(15);
		expect(grouped.afternoon[0].getUTCHours()).toBe(12);
		expect(grouped.evening[0].getUTCHours()).toBe(17);
		expect(grouped.evening[0].getUTCMinutes()).toBe(30);
	});

	it('treats 11:45 as morning and 17:00 as evening', () => {
		const dayKey = '2026-06-15';
		const grouped = groupSlotsByPeriod(
			[
				wallClockToDate(dayKey, '11:45', 'UTC'),
				wallClockToDate(dayKey, '16:59', 'UTC'),
				wallClockToDate(dayKey, '17:00', 'UTC')
			],
			'UTC'
		);

		expect(grouped.morning).toHaveLength(1);
		expect(grouped.afternoon).toHaveLength(1);
		expect(grouped.evening).toHaveLength(1);
		expect(grouped.afternoon[0].getUTCHours()).toBe(16);
		expect(grouped.evening[0].getUTCHours()).toBe(17);
		expect(grouped.evening[0].getUTCMinutes()).toBe(0);
	});
});
