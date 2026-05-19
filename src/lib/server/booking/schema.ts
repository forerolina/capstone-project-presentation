import { z } from 'zod';
import { BOOKING_SERVICES } from '$lib/booking/services';

export interface BookingFieldErrors {
	clientName?: string[];
	clientEmail?: string[];
	clientPhone?: string[];
	serviceName?: string[];
	appointmentDate?: string[];
	appointmentTime?: string[];
}

const appointmentBookingFieldsSchema = z.object({
	clientName: z.string().trim().min(1, 'Name is required').max(200),
	clientEmail: z.string().trim().email('Valid email required'),
	clientPhone: z.string().trim().max(50).optional(),
	serviceName: z.enum(BOOKING_SERVICES, { message: 'Please choose a service' }),
	appointmentDate: z.string().trim().min(1, 'Date is required'),
	appointmentTime: z.string().trim().min(1, 'Time is required')
});

export const bookingFormSchema = appointmentBookingFieldsSchema;
export const ownerCreateFormSchema = appointmentBookingFieldsSchema;

export type BookingFormInput = z.infer<typeof bookingFormSchema>;
