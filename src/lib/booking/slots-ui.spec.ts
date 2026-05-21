import { describe, expect, it } from 'vitest';
import { getAvailableSlots } from './slots-ui';

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
