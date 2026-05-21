import { z } from 'zod';
import { SERVICE_DURATION_PRESETS } from '$lib/booking/service-catalog';

const durationSchema = z.coerce
	.number()
	.int()
	.refine(
		(v) => (SERVICE_DURATION_PRESETS as readonly number[]).includes(v),
		'Choose a valid duration'
	);

export const serviceFormSchema = z.object({
	name: z.string().trim().min(1, 'Name is required').max(80, 'Name is too long'),
	durationMinutes: durationSchema
});

export type ServiceFormInput = z.infer<typeof serviceFormSchema>;

export interface ServiceFieldErrors {
	name?: string[];
	durationMinutes?: string[];
}

export const deletedServiceUndoSchema = z.object({
	id: z.string().uuid(),
	name: z.string().trim().min(1).max(80),
	durationMinutes: durationSchema,
	appointmentIds: z.array(z.string().uuid())
});

export type DeletedServiceUndo = z.infer<typeof deletedServiceUndoSchema>;
