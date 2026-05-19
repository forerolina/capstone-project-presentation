import { describe, expect, it } from 'vitest';
import { isSlotAvailable } from './slots';

describe('isSlotAvailable', () => {
	const base = new Date('2026-06-10T14:00:00.000Z');

	it('returns true when no appointments overlap', () => {
		expect(isSlotAvailable(base, [])).toBe(true);
	});

	it('returns false when an upcoming appointment overlaps', () => {
		expect(
			isSlotAvailable(base, [
				{
					id: 'a1',
					startsAt: new Date(base.getTime()),
					status: 'upcoming'
				}
			])
		).toBe(false);
	});

	it('ignores cancelled appointments', () => {
		expect(
			isSlotAvailable(base, [
				{
					id: 'a1',
					startsAt: new Date(base.getTime()),
					status: 'cancelled'
				}
			])
		).toBe(true);
	});

	it('ignores the excluded appointment', () => {
		expect(
			isSlotAvailable(
				base,
				[
					{
						id: 'a1',
						startsAt: new Date(base.getTime()),
						status: 'upcoming'
					}
				],
				'a1'
			)
		).toBe(true);
	});
});
