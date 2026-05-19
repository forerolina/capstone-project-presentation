import { createHmac, timingSafeEqual } from 'node:crypto';
import { env } from '$env/dynamic/private';

function getSecret(): string {
	const secret = env.BETTER_AUTH_SECRET;
	if (!secret) {
		throw new Error('BETTER_AUTH_SECRET is not set');
	}
	return secret;
}

function sign(appointmentId: string): string {
	return createHmac('sha256', getSecret()).update(appointmentId).digest('base64url');
}

export function createConfirmToken(appointmentId: string): string {
	return `${appointmentId}.${sign(appointmentId)}`;
}

export function parseConfirmToken(token: string): string | null {
	const dot = token.lastIndexOf('.');
	if (dot <= 0) return null;

	const appointmentId = token.slice(0, dot);
	const mac = token.slice(dot + 1);
	if (!appointmentId || !mac) return null;

	const expected = sign(appointmentId);
	if (mac.length !== expected.length) return null;

	try {
		if (!timingSafeEqual(Buffer.from(mac), Buffer.from(expected))) return null;
	} catch {
		return null;
	}

	return appointmentId;
}

export function getConfirmUrl(appointmentId: string, origin?: string): string {
	const base = (origin ?? env.ORIGIN)?.replace(/\/$/, '');
	if (!base) {
		throw new Error('ORIGIN is not set');
	}
	const token = createConfirmToken(appointmentId);
	return `${base}/confirm?t=${encodeURIComponent(token)}`;
}
