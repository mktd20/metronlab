<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import Navbar from '$lib/components/Navbar.svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import type { LayoutData } from './$types';
	import { onMount } from 'svelte';
	import { registerServiceWorker, onOnlineStatusChange } from '$lib/pwa';

	let { data, children }: { data: LayoutData; children: any } = $props();
	let sidebarOpen = $state(false);
	let isOnline = $state(true);

	onMount(() => {
		// Skip to main content link functionality
		const skipLink = document.getElementById('skip-to-main');
		if (skipLink) {
			skipLink.addEventListener('click', (e) => {
				e.preventDefault();
				const main = document.getElementById('main-content');
				if (main) {
					main.focus();
					main.scrollIntoView({ behavior: 'smooth' });
				}
			});
		}

		// Register service worker for PWA
		if (typeof window !== 'undefined') {
			registerServiceWorker();

			// Monitor online/offline status
			isOnline = navigator.onLine;
			const cleanup = onOnlineStatusChange((online) => {
				isOnline = online;
			});

			return cleanup;
		}
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{#if data.user}
	<!-- Authenticated Layout -->
	<div class="min-h-screen flex">
		<!-- Skip to main content link for screen readers -->
		<a
			id="skip-to-main"
			href="#main-content"
			class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#6C5CE7] focus:text-white focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2"
		>
			메인 콘텐츠로 건너뛰기
		</a>
		<Sidebar user={data.user} bind:open={sidebarOpen} />
		<div class="flex-1 flex flex-col min-w-0">
			<Navbar user={data.user} onToggleSidebar={() => (sidebarOpen = !sidebarOpen)} />
			<!-- Offline indicator -->
			{#if !isOnline}
				<div class="bg-[#FDCB6E]/10 border-b border-[#FDCB6E]/20 px-6 py-2 text-center">
					<p class="text-sm text-[#FDCB6E]">
						오프라인 모드입니다. 일부 기능이 제한될 수 있습니다.
					</p>
				</div>
			{/if}
			<main id="main-content" tabindex="-1" class="flex-1 p-6 overflow-auto">
				{@render children()}
			</main>
		</div>
	</div>
{:else}
	<!-- Public Layout -->
	{@render children()}
{/if}

<style>
	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border-width: 0;
	}

	.focus\:not-sr-only:focus {
		position: static;
		width: auto;
		height: auto;
		padding: inherit;
		margin: inherit;
		overflow: visible;
		clip: auto;
		white-space: normal;
	}
</style>
