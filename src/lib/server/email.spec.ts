import { describe, expect, it } from 'vitest';
import { formatResendError } from './email';

describe('formatResendError', () => {
	it('explains Resend test-mode restriction for client emails', () => {
		const body = JSON.stringify({
			statusCode: 403,
			message:
				'You can only send testing emails to your own email address (user@example.com). To send emails to other recipients, please verify a domain at resend.com/domains.'
		});
		const msg = formatResendError(403, body);
		expect(msg).toContain('verify a domain');
		expect(msg).not.toContain('user@example.com');
	});

	it('returns API message for other errors', () => {
		const body = JSON.stringify({ message: 'Invalid from address' });
		expect(formatResendError(422, body)).toBe('Invalid from address');
	});
});
