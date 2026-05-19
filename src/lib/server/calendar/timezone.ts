import { DEFAULT_BUSINESS_TIMEZONE } from '$lib/calendar/timezone';
import { env } from '$env/dynamic/private';

export function getBusinessTimezone(): string {
	const value = env.BUSINESS_TIMEZONE?.trim();
	return value && value.length > 0 ? value : DEFAULT_BUSINESS_TIMEZONE;
}
