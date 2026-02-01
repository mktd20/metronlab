import { sequence } from '@sveltejs/kit/hooks';
import type { Handle } from '@sveltejs/kit';
import * as auth from './lib/server/auth';
import { checkRateLimit, getRateLimitIdentifier } from './lib/server/rate-limit';
import * as csrf from './lib/server/csrf';
import { error } from '@sveltejs/kit';

const handleAuth: Handle = async ({ event, resolve }) => {
	const sessionToken = event.cookies.get(auth.sessionCookieName);

	if (!sessionToken) {
		event.locals.user = null;
		event.locals.session = null;
		return resolve(event);
	}

	const { session, user } = await auth.validateSessionToken(sessionToken);

	if (session) {
		auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);
	} else {
		auth.deleteSessionTokenCookie(event);
	}

	event.locals.user = user;
	event.locals.session = session;

	// Set CSRF token if not present
	if (!csrf.getCsrfTokenFromCookie(event)) {
		const token = csrf.generateCsrfToken();
		csrf.setCsrfTokenCookie(event, token);
	}

	return resolve(event);
};

// Rate limiting middleware
const rateLimitHandler: Handle = async ({ event, resolve }) => {
	// Skip rate limiting for static assets
	if (event.url.pathname.startsWith('/_app/') || event.url.pathname.startsWith('/favicon')) {
		return resolve(event);
	}

	// Apply stricter rate limiting to API endpoints
	if (event.url.pathname.startsWith('/api/')) {
		const identifier = getRateLimitIdentifier(event.request, event.locals);
		const config = {
			maxRequests: event.url.pathname.includes('/ai/') ? 10 : 100, // Stricter for AI endpoints
			windowMs: 60 * 1000
		};

		const result = checkRateLimit(identifier, config);

		if (!result.allowed) {
			error(429, {
				message: 'Too many requests. Please try again later.',
				retryAfter: Math.ceil((result.resetAt - Date.now()) / 1000)
			});
		}

		// Validate CSRF token for state-changing requests (POST, PUT, DELETE, PATCH)
		const method = event.request.method;
		if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
			if (!csrf.validateCsrfToken(event)) {
				error(403, 'Invalid CSRF token');
			}
		}

		// Add rate limit headers
		const response = await resolve(event);
		response.headers.set('X-RateLimit-Limit', config.maxRequests.toString());
		response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
		response.headers.set('X-RateLimit-Reset', result.resetAt.toString());
		return response;
	}

	return resolve(event);
};

export const handle = sequence(handleAuth, rateLimitHandler);
