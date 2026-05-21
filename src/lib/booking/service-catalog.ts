export interface BookingServiceOption {
	id: string;
	name: string;
	durationMinutes: number;
}

export const SERVICE_DURATION_PRESETS = [15, 30, 45, 60, 90, 120] as const;

export function formatDurationMinutes(minutes: number): string {
	return minutes === 60 ? '1 hr' : `${minutes} min`;
}
