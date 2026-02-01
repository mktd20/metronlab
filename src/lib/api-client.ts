// API client with automatic CSRF token handling
import { addCsrfHeader } from './csrf';

export async function apiFetch(
	url: string,
	options: RequestInit = {}
): Promise<Response> {
	const headers = addCsrfHeader(options.headers || {});
	
	return fetch(url, {
		...options,
		headers: {
			'Content-Type': 'application/json',
			...headers,
			...(options.headers || {})
		}
	});
}

export async function apiPost<T = any>(
	url: string,
	body: any,
	options: RequestInit = {}
): Promise<T> {
	const response = await apiFetch(url, {
		...options,
		method: 'POST',
		body: JSON.stringify(body)
	});

	if (!response.ok) {
		const error = await response.json().catch(() => ({ message: 'Request failed' }));
		throw new Error(error.message || 'Request failed');
	}

	return response.json();
}

export async function apiDelete(
	url: string,
	options: RequestInit = {}
): Promise<void> {
	const response = await apiFetch(url, {
		...options,
		method: 'DELETE'
	});

	if (!response.ok) {
		const error = await response.json().catch(() => ({ message: 'Request failed' }));
		throw new Error(error.message || 'Request failed');
	}
}
