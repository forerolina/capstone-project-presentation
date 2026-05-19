export const BOOKING_SERVICES = ['Service 1', 'Service 2', 'Service 3', 'Service 4'] as const;

export type BookingService = (typeof BOOKING_SERVICES)[number];
