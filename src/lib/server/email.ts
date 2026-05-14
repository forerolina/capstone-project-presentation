import { env } from '$env/dynamic/private';

export interface SendBookingConfirmationParams {
	to: string;
	clientName: string;
	startsAt: Date;
	amountCents: number;
	currency: string;
}

export async function sendBookingConfirmation(
	params: SendBookingConfirmationParams
): Promise<void> {
	const key = env.RESEND_API_KEY;
	const from = env.RESEND_FROM;
	const businessName = env.BUSINESS_NAME ?? 'Our business';

	if (!key || !from) {
		console.warn('RESEND_API_KEY or RESEND_FROM not set; skipping confirmation email');
		return;
	}

	const amount = (params.amountCents / 100).toFixed(2);
	const when = params.startsAt.toISOString();

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
			text: `Hi ${params.clientName},\n\nYour appointment is confirmed for ${when}.\nAmount paid: ${params.currency.toUpperCase()} ${amount}.\n\nThank you,\n${businessName}`
		})
	});

	if (!res.ok) {
		const body = await res.text();
		throw new Error(`Resend failed: ${res.status} ${body}`);
	}
}
