import { describe, expect, it } from 'vitest';
import { isSlotAvailable } from './slots';

describe('isSlotAvailable', () => {
	const base = new Date('2026-06-10T14:00:00.000Z');

	it('returns true when no appointments overlap', () => {
		expect(isSlotAvailable(base, 60, [])).toBe(true);
	});

	it('returns false when an upcoming appointment overlaps', () => {
		expect(
			isSlotAvailable(base, 60, [
				{
					id: 'a1',
					startsAt: new Date(base.getTime()),
					durationMinutes: 60,
					status: 'upcoming'
				}
			])
		).toBe(false);
	});

	it('respects per-appointment duration when checking overlap', () => {
		expect(
			isSlotAvailable(base, 30, [
				{
					id: 'a1',
					startsAt: new Date(base.getTime() + 30 * 60 * 1000),
					durationMinutes: 60,
					status: 'upcoming'
				}
			])
		).toBe(true);
	});

	it('ignores cancelled appointments', () => {
		expect(
			isSlotAvailable(base, 60, [
				{
					id: 'a1',
					startsAt: new Date(base.getTime()),
					durationMinutes: 60,
					status: 'cancelled'
				}
			])
		).toBe(true);
	});

	it('ignores the excluded appointment', () => {
		expect(
			isSlotAvailable(
				base,
				60,
				[
					{
						id: 'a1',
						startsAt: new Date(base.getTime()),
						durationMinutes: 60,
						status: 'upcoming'
					}
				],
				'a1'
			)
		).toBe(true);
	});
});
