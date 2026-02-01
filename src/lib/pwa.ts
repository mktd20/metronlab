// PWA utilities for service worker registration and push notifications

let registration: ServiceWorkerRegistration | null = null;

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
	if ('serviceWorker' in navigator) {
		try {
			registration = await navigator.serviceWorker.register('/sw.js', {
				scope: '/'
			});

			console.log('Service Worker registered:', registration.scope);

			// Check for updates
			registration.addEventListener('updatefound', () => {
				const newWorker = registration!.installing;
				if (newWorker) {
					newWorker.addEventListener('statechange', () => {
						if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
							// New service worker available
							console.log('New service worker available');
							// Could show a notification to the user
						}
					});
				}
			});

			return registration;
		} catch (error) {
			console.error('Service Worker registration failed:', error);
			return null;
		}
	}
	return null;
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
	if ('Notification' in window) {
		const permission = await Notification.requestPermission();
		return permission;
	}
	return 'denied';
}

export async function showNotification(title: string, options?: NotificationOptions): Promise<void> {
	if ('Notification' in window && Notification.permission === 'granted') {
		if (registration) {
			await registration.showNotification(title, {
				icon: '/favicon.svg',
				badge: '/favicon.svg',
				vibrate: [200, 100, 200],
				...options
			});
		}
	}
}

export function isOnline(): boolean {
	return navigator.onLine;
}

export function onOnlineStatusChange(callback: (online: boolean) => void): () => void {
	const handleOnline = () => callback(true);
	const handleOffline = () => callback(false);

	window.addEventListener('online', handleOnline);
	window.addEventListener('offline', handleOffline);

	// Return cleanup function
	return () => {
		window.removeEventListener('online', handleOnline);
		window.removeEventListener('offline', handleOffline);
	};
}
