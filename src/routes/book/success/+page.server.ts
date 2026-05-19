import { eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getBusinessTimezone } from '$lib/server/calendar/timezone';
import { db } from '$lib/server/db';
import { appointment } from '$lib/server/db/schema';

export const load: PageServerLoad = async ({ url }) => {
	const id = url.searchParams.get('id');
	if (!id) {
		return { appointment: null, businessTimezone: getBusinessTimezone() };
	}

	const [row] = await db.select().from(appointment).where(eq(appointment.id, id)).limit(1);
	if (!row) {
		error(404, 'Booking not found');
	}

	return { appointment: row, businessTimezone: getBusinessTimezone() };
};
