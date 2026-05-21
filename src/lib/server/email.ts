import { formatDateTimeInZone } from '$lib/calendar/datetime';
import { getBusinessTimezone } from '$lib/server/calendar/timezone';
import { env } from '$env/dynamic/private';

export interface SendBookingConfirmationParams {
	to: string;
	clientName: string;
	startsAt: Date;
}

function getResendConfig(): { apiKey: string; from: string } {
	const apiKey = env.RESEND_API_KEY?.trim();
	const from = env.RESEND_FROM?.trim();
	if (!apiKey || !from) {
		throw new Error(
			'Email is not configured. Set RESEND_API_KEY and RESEND_FROM in your environment.'
		);
	}
	return { apiKey, from };
}

/** User-facing message from a Resend API error response. */
export function formatResendError(status: number, body: string): string {
	try {
		const data = JSON.parse(body) as { message?: string };
		const apiMessage = data.message?.trim();
		if (
			status === 403 &&
			apiMessage?.toLowerCase().includes('only send testing emails')
		) {
			return (
				'Resend test mode only delivers to your account email. To email clients, verify a domain at resend.com/domains and set RESEND_FROM to an address on that domain (not onboarding@resend.dev).'
			);
		}
		if (apiMessage) return apiMessage;
	} catch {
		// use raw body below
	}
	return body.trim() || `Email failed (${status})`;
}

async function sendResendEmail(params: {
	to: string;
	subject: string;
	text: string;
}): Promise<void> {
	const { apiKey, from } = getResendConfig();

	const res = await fetch('https://api.resend.com/emails', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${apiKey}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			from,
			to: params.to,
			subject: params.subject,
			text: params.text
		})
	});

	if (!res.ok) {
		const body = await res.text();
		throw new Error(formatResendError(res.status, body));
	}
}

function formatWhen(startsAt: Date): string {
	return formatDateTimeInZone(startsAt, getBusinessTimezone());
}

export async function sendBookingConfirmation(
	params: SendBookingConfirmationParams
): Promise<void> {
	const businessName = env.BUSINESS_NAME ?? 'Our business';
	const prepNotes = env.APPOINTMENT_PREP_NOTES?.trim();
	const when = formatWhen(params.startsAt);

	const lines = [
		`Hi ${params.clientName},`,
		'',
		`Your appointment with ${businessName} is confirmed.`,
		'',
		`When: ${when}`
	];

	if (prepNotes) {
		lines.push('', 'Before your visit:', prepNotes);
	}

	lines.push('', 'Thank you,', businessName);

	await sendResendEmail({
		to: params.to,
		subject: `Appointment confirmed — ${businessName}`,
		text: lines.join('\n')
	});
}

export interface SendAppointmentReminderParams {
	to: string;
	clientName: string;
	startsAt: Date;
	confirmUrl: string;
}

export async function sendAppointmentReminder(
	params: SendAppointmentReminderParams
): Promise<void> {
	const businessName = env.BUSINESS_NAME ?? 'Our business';
	const prepNotes = env.APPOINTMENT_PREP_NOTES?.trim();
	const when = formatWhen(params.startsAt);

	const lines = [
		`Hi ${params.clientName},`,
		'',
		`This is a reminder about your upcoming appointment with ${businessName}.`,
		'',
		`When: ${when}`,
		'',
		'Please confirm you can still make it:',
		params.confirmUrl
	];

	if (prepNotes) {
		lines.push('', 'Before your visit:', prepNotes);
	}

	lines.push('', 'Thank you,', businessName);

	await sendResendEmail({
		to: params.to,
		subject: `Appointment reminder — ${businessName}`,
		text: lines.join('\n')
	});
}
