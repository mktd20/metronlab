import { encodeBase64url } from '@oslojs/encoding';
import type { RequestEvent } from '@sveltejs/kit';

const CSRF_TOKEN_COOKIE = 'csrf-token';
const CSRF_TOKEN_HEADER = 'x-csrf-token';

// Generate a random CSRF token
export function generateCsrfToken(): string {
	const bytes = crypto.getRandomValues(new Uint8Array(32));
	return encodeBase64url(bytes);
}

// Set CSRF token cookie
export function setCsrfTokenCookie(event: RequestEvent, token: string) {
	event.cookies.set(CSRF_TOKEN_COOKIE, token, {
		httpOnly: false, // Must be accessible to JavaScript for form submissions
		sameSite: 'lax',
		path: '/',
		secure: process.env.NODE_ENV === 'production'
	});
}

// Get CSRF token from cookie
export function getCsrfTokenFromCookie(event: RequestEvent): string | null {
	return event.cookies.get(CSRF_TOKEN_COOKIE) || null;
}

// Validate CSRF token
export function validateCsrfToken(event: RequestEvent): boolean {
	// Skip CSRF validation for GET, HEAD, OPTIONS
	const method = event.request.method;
	if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
		return true;
	}

	const cookieToken = getCsrfTokenFromCookie(event);
	const headerToken = event.request.headers.get(CSRF_TOKEN_HEADER);

	if (!cookieToken || !headerToken) {
		return false;
	}

	// Use constant-time comparison to prevent timing attacks
	return constantTimeEqual(cookieToken, headerToken);
}

// Constant-time string comparison
function constantTimeEqual(a: string, b: string): boolean {
	if (a.length !== b.length) {
		return false;
	}

	let result = 0;
	for (let i = 0; i < a.length; i++) {
		result |= a.charCodeAt(i) ^ b.charCodeAt(i);
	}

	return result === 0;
}
