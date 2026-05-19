import { env } from '$env/dynamic/private';

export interface SendBookingConfirmationParams {
	to: string;
	clientName: string;
	startsAt: Date;
}

function formatWhen(startsAt: Date): string {
	return startsAt.toLocaleString(undefined, { dateStyle: 'full', timeStyle: 'short' });
}

export async function sendBookingConfirmation(
	params: SendBookingConfirmationParams
): Promise<void> {
	const key = env.RESEND_API_KEY;
	const from = env.RESEND_FROM;
	const businessName = env.BUSINESS_NAME ?? 'Our business';
	const prepNotes = env.APPOINTMENT_PREP_NOTES?.trim();

	if (!key || !from) {
		console.warn('RESEND_API_KEY or RESEND_FROM not set; skipping confirmation email');
		return;
	}

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

	const res = await fetch('https://api.resend.com/emails', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${key}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			from,
			to: params.to,
			subject: `Appointment confirmed — ${businessName}`,
			text: lines.join('\n')
		})
	});

	if (!res.ok) {
		const body = await res.text();
		throw new Error(`Resend failed: ${res.status} ${body}`);
	}
}
