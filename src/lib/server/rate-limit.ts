// Simple in-memory rate limiter
// For production, consider using Redis or a dedicated rate limiting service

interface RateLimitEntry {
	count: number;
	resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

export interface RateLimitConfig {
	maxRequests: number;
	windowMs: number;
}

const defaultConfig: RateLimitConfig = {
	maxRequests: 100,
	windowMs: 60 * 1000 // 1 minute
};

export function checkRateLimit(
	identifier: string,
	config: RateLimitConfig = defaultConfig
): { allowed: boolean; remaining: number; resetAt: number } {
	const now = Date.now();
	const entry = rateLimitStore.get(identifier);

	if (!entry || entry.resetAt < now) {
		// Create new entry or reset expired entry
		const resetAt = now + config.windowMs;
		rateLimitStore.set(identifier, {
			count: 1,
			resetAt
		});
		return {
			allowed: true,
			remaining: config.maxRequests - 1,
			resetAt
		};
	}

	if (entry.count >= config.maxRequests) {
		return {
			allowed: false,
			remaining: 0,
			resetAt: entry.resetAt
		};
	}

	entry.count++;
	return {
		allowed: true,
		remaining: config.maxRequests - entry.count,
		resetAt: entry.resetAt
	};
}

// Clean up expired entries periodically
setInterval(() => {
	const now = Date.now();
	for (const [key, entry] of rateLimitStore.entries()) {
		if (entry.resetAt < now) {
			rateLimitStore.delete(key);
		}
	}
}, 5 * 60 * 1000); // Clean up every 5 minutes

export function getRateLimitIdentifier(request: Request, locals: { user?: { id: string } }): string {
	// Use user ID if authenticated, otherwise use IP
	if (locals.user) {
		return `user:${locals.user.id}`;
	}
	// In production, extract IP from request headers
	const forwarded = request.headers.get('x-forwarded-for');
	const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
	return `ip:${ip}`;
}
