import { describe, expect, it } from 'vitest';
import { getAvailableSlots } from './slots-ui';

describe('getAvailableSlots', () => {
	it('returns no slots on weekends', () => {
		expect(
			getAvailableSlots('2026-05-16', [], 'UTC') // Saturday
		).toEqual([]);
		expect(
			getAvailableSlots('2026-05-17', [], 'UTC') // Sunday
		).toEqual([]);
	});
});
