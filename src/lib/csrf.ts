// Client-side CSRF token helper
// This file is used by SvelteKit forms to include CSRF tokens

export function getCsrfToken(): string | null {
	// Get CSRF token from cookie (set by server)
	const cookies = document.cookie.split(';');
	for (const cookie of cookies) {
		const [name, value] = cookie.trim().split('=');
		if (name === 'csrf-token') {
			return decodeURIComponent(value);
		}
	}
	return null;
}

export function addCsrfHeader(headers: HeadersInit = {}): HeadersInit {
	const token = getCsrfToken();
	if (!token) {
		return headers;
	}

	const headersObj = headers instanceof Headers ? headers : new Headers(headers);
	headersObj.set('x-csrf-token', token);
	return headersObj;
}
