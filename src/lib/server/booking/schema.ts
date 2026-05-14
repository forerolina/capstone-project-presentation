import { z } from 'zod';

export interface BookingFieldErrors {
	clientName?: string[];
	clientEmail?: string[];
	clientPhone?: string[];
	startsAt?: string[];
}

export const bookingFormSchema = z.object({
	clientName: z.string().trim().min(1, 'Name is required').max(200),
	clientEmail: z.string().trim().email('Valid email required'),
	clientPhone: z.string().trim().max(50).optional(),
	startsAt: z.string().trim().min(1, 'Date and time required')
});

export type BookingFormInput = z.infer<typeof bookingFormSchema>;
