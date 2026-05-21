const MS_PER_MINUTE = 60 * 1000;

type SlotAppointment = {
	id?: string;
	startsAt: Date;
	durationMinutes: number;
	status: string;
};

export function isSlotAvailable(
	startsAt: Date,
	slotDurationMinutes: number,
	appointments: SlotAppointment[],
	excludeId?: string
): boolean {
	const slotEnd = new Date(startsAt.getTime() + slotDurationMinutes * MS_PER_MINUTE);

	return !appointments.some((appt) => {
		if (excludeId && appt.id === excludeId) return false;
		if (appt.status !== 'upcoming') return false;
		const apptStart = appt.startsAt;
		const apptEnd = new Date(apptStart.getTime() + appt.durationMinutes * MS_PER_MINUTE);
		return apptStart < slotEnd && apptEnd > startsAt;
	});
}
