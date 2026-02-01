<script lang="ts">
	import { page } from '$app/state';

	interface Props {
		user: { id: string; email: string; displayName: string; avatarUrl: string | null };
		open: boolean;
	}

	let { user, open = $bindable(false) }: Props = $props();

	import MetronomeModal from '$lib/components/metronome/MetronomeModal.svelte';
	import TunerModal from '$lib/components/tools/TunerModal.svelte';

	let showMetronomeModal = $state(false);
	let showTunerModal = $state(false);

	const navItems = [
		{ href: '/dashboard', label: '대시보드', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
		{ href: '/practice', label: '연습하기', icon: 'M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3' },
		{ href: '/history', label: '연습 기록', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
		{ href: '/feed', label: '피드', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
		{ href: '/rooms', label: '합주방', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
		{ href: '/goals', label: '목표 & 루틴', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
		{ href: '/instruments', label: '악기 관리', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' }
	];

	function isActive(href: string): boolean {
		return page.url.pathname === href || page.url.pathname.startsWith(href + '/');
	}
</script>

<!-- Overlay for mobile -->
{#if open}
	<button
		class="fixed inset-0 bg-black/50 z-40 lg:hidden"
		onclick={() => (open = false)}
		aria-label="Close sidebar"
	></button>
{/if}

<aside
	class="fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#1A1A2E] border-r border-[#2A2A3E] flex flex-col transition-transform duration-300 {open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0"
>
	<!-- Logo -->
	<div class="h-16 flex items-center px-6 border-b border-[#2A2A3E]">
		<a href="/dashboard" class="text-xl font-bold text-white">
			<span class="text-[#6C5CE7]">Metron</span>Lab
		</a>
	</div>

	<!-- Navigation -->
	<nav class="flex-1 py-4 px-3 space-y-1">
		{#each navItems as item}
			<a
				href={item.href}
				onclick={() => (open = false)}
				aria-current={isActive(item.href) ? 'page' : undefined}
				class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-[#6C5CE7] focus:ring-offset-2 focus:ring-offset-[#1A1A2E] {isActive(item.href)
					? 'bg-[#6C5CE7]/10 text-[#6C5CE7]'
					: 'text-[#8B8BA7] hover:text-white hover:bg-[#222240]'}"
			>
				<svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d={item.icon} />
				</svg>
				{item.label}
			</a>
		{/each}
		
		<!-- Metronome Button -->
		<button
			onclick={() => {
				showMetronomeModal = true;
				open = false;
			}}
			onkeydown={(e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault();
					showMetronomeModal = true;
					open = false;
				}
			}}
			aria-label="메트로놈 열기"
			class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition text-[#8B8BA7] hover:text-white hover:bg-[#222240] focus:outline-none focus:ring-2 focus:ring-[#6C5CE7] focus:ring-offset-2 focus:ring-offset-[#1A1A2E]"
		>
			<svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
			</svg>
			메트로놈
		</button>
		
		<!-- Tuner Button -->
		<button
			onclick={() => {
				showTunerModal = true;
				open = false;
			}}
			onkeydown={(e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault();
					showTunerModal = true;
					open = false;
				}
			}}
			aria-label="튜너 열기"
			class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition text-[#8B8BA7] hover:text-white hover:bg-[#222240] focus:outline-none focus:ring-2 focus:ring-[#6C5CE7] focus:ring-offset-2 focus:ring-offset-[#1A1A2E]"
		>
			<svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
			</svg>
			튜너
		</button>
	</nav>

	<!-- User Section -->
	<div class="p-4 border-t border-[#2A2A3E]">
		<div class="flex items-center gap-3">
			<div class="w-8 h-8 rounded-full bg-[#6C5CE7] flex items-center justify-center text-white text-sm font-bold">
				{user.displayName.charAt(0).toUpperCase()}
			</div>
			<div class="min-w-0">
				<p class="text-sm font-medium text-white truncate">{user.displayName}</p>
				<p class="text-xs text-[#8B8BA7] truncate">{user.email}</p>
			</div>
		</div>
	</div>
</aside>

<MetronomeModal open={showMetronomeModal} onClose={() => (showMetronomeModal = false)} />
<TunerModal open={showTunerModal} onClose={() => (showTunerModal = false)} />
