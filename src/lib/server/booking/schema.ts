import { z } from 'zod';
import { BOOKING_SERVICES } from '$lib/booking/services';

export interface BookingFieldErrors {
	clientName?: string[];
	clientEmail?: string[];
	clientPhone?: string[];
	serviceName?: string[];
	startsAt?: string[];
}

export const bookingFormSchema = z.object({
	clientName: z.string().trim().min(1, 'Name is required').max(200),
	clientEmail: z.string().trim().email('Valid email required'),
	clientPhone: z.string().trim().max(50).optional(),
	serviceName: z.enum(BOOKING_SERVICES, { message: 'Please choose a service' }),
	startsAt: z.string().trim().min(1, 'Date and time required')
});

export type BookingFormInput = z.infer<typeof bookingFormSchema>;
