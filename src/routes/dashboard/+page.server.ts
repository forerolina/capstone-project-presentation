import { redirect } from '@sveltejs/kit';
import { desc, eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { auth } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { appointment } from '$lib/server/db/schema';

export const load: PageServerLoad = async () => {
	const appointments = await db
		.select()
		.from(appointment)
		.where(eq(appointment.status, 'confirmed'))
		.orderBy(desc(appointment.startsAt));

	return { appointments };
};

export const actions: Actions = {
	signOut: async (event) => {
		await auth.api.signOut({
			headers: event.request.headers
		});
		throw redirect(302, '/login');
	}
};
