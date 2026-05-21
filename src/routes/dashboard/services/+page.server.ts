import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { auth } from '$lib/server/auth';
import {
	createService,
	deleteService,
	listServices,
	restoreDeletedService,
	syncAppointmentServiceNames,
	updateService
} from '$lib/server/service';
import {
	deletedServiceUndoSchema,
	serviceFormSchema,
	type ServiceFieldErrors
} from '$lib/server/service/schema';

export const load: PageServerLoad = async () => {
	const services = await listServices();
	return { services };
};

export const actions: Actions = {
	createService: async ({ request }) => {
		const formData = await request.formData();
		const parsed = serviceFormSchema.safeParse({
			name: formData.get('name'),
			durationMinutes: formData.get('durationMinutes')
		});

		const nameRaw = formData.get('name');
		const durationRaw = formData.get('durationMinutes');

		if (!parsed.success) {
			const fieldErrors = parsed.error.flatten().fieldErrors as ServiceFieldErrors;
			return fail(400, {
				modal: 'create',
				fieldErrors,
				message: 'Please fix the form.',
				name: typeof nameRaw === 'string' ? nameRaw : '',
				durationMinutes: typeof durationRaw === 'string' ? durationRaw : ''
			});
		}

		const result = await createService(parsed.data);
		if (!result.ok) {
			return fail(400, {
				modal: 'create',
				message: result.message,
				name: parsed.data.name,
				durationMinutes: String(parsed.data.durationMinutes)
			});
		}

		return { success: true };
	},

	updateService: async ({ request }) => {
		const formData = await request.formData();
		const serviceId = formData.get('serviceId');

		if (typeof serviceId !== 'string' || serviceId === '') {
			return fail(400, { message: 'Missing service.' });
		}

		const parsed = serviceFormSchema.safeParse({
			name: formData.get('name'),
			durationMinutes: formData.get('durationMinutes')
		});

		const nameRaw = formData.get('name');
		const durationRaw = formData.get('durationMinutes');

		if (!parsed.success) {
			const fieldErrors = parsed.error.flatten().fieldErrors as ServiceFieldErrors;
			return fail(400, {
				modal: 'edit',
				serviceId,
				fieldErrors,
				message: 'Please fix the form.',
				name: typeof nameRaw === 'string' ? nameRaw : '',
				durationMinutes: typeof durationRaw === 'string' ? durationRaw : ''
			});
		}

		const result = await updateService(serviceId, parsed.data);
		if (!result.ok) {
			return fail(400, {
				modal: 'edit',
				serviceId,
				message: result.message,
				name: parsed.data.name,
				durationMinutes: String(parsed.data.durationMinutes)
			});
		}

		await syncAppointmentServiceNames();

		return { success: true };
	},

	deleteService: async ({ request }) => {
		const formData = await request.formData();
		const serviceId = formData.get('serviceId');

		if (typeof serviceId !== 'string' || serviceId === '') {
			return fail(400, { message: 'Missing service.' });
		}

		const result = await deleteService(serviceId);
		if (!result.ok) {
			return fail(400, { message: result.message });
		}

		return {
			success: true,
			warning: result.warning,
			undo: result.undo
		};
	},

	undoDeleteService: async ({ request }) => {
		const formData = await request.formData();
		const appointmentIdsRaw = formData.get('appointmentIds');
		const appointmentIds =
			typeof appointmentIdsRaw === 'string' && appointmentIdsRaw.trim() !== ''
				? appointmentIdsRaw.split(',').map((id) => id.trim())
				: [];

		const parsed = deletedServiceUndoSchema.safeParse({
			id: formData.get('id'),
			name: formData.get('name'),
			durationMinutes: formData.get('durationMinutes'),
			appointmentIds
		});
		if (!parsed.success) {
			return fail(400, { message: 'Could not undo — try adding the service again.' });
		}

		const result = await restoreDeletedService(parsed.data);
		if (!result.ok) {
			return fail(400, { message: result.message });
		}

		return {
			success: true,
			restored: true,
			restoredName: result.name
		};
	},

	signOut: async (event) => {
		await auth.api.signOut({
			headers: event.request.headers
		});
		throw redirect(302, '/book');
	}
};
