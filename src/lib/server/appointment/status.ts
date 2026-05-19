export const AppointmentStatus = {
	Upcoming: 'upcoming',
	Cancelled: 'cancelled'
} as const;

export type AppointmentStatus = (typeof AppointmentStatus)[keyof typeof AppointmentStatus];
