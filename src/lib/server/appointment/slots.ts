const MS_PER_HOUR = 60 * 60 * 1000;

type SlotAppointment = {
	id?: string;
	startsAt: Date;
	status: string;
};

export function isSlotAvailable(
	startsAt: Date,
	appointments: SlotAppointment[],
	excludeId?: string
): boolean {
	const slotEnd = new Date(startsAt.getTime() + MS_PER_HOUR);

	return !appointments.some((appt) => {
		if (excludeId && appt.id === excludeId) return false;
		if (appt.status !== 'upcoming') return false;
		const apptStart = appt.startsAt;
		const apptEnd = new Date(apptStart.getTime() + MS_PER_HOUR);
		return apptStart < slotEnd && apptEnd > startsAt;
	});
}
