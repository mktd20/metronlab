<script lang="ts">
	import { enhance } from '$app/forms';

	interface Props {
		user: { id: string; email: string; displayName: string; avatarUrl: string | null };
		onToggleSidebar: () => void;
	}

	let { user, onToggleSidebar }: Props = $props();
</script>

<header class="h-16 bg-[#1A1A2E] border-b border-[#2A2A3E] flex items-center justify-between px-6 shrink-0">
	<div class="flex items-center gap-4">
		<button
			onclick={onToggleSidebar}
			onkeydown={(e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault();
					onToggleSidebar();
				}
			}}
			aria-label="사이드바 토글"
			aria-expanded={false}
			class="lg:hidden text-[#8B8BA7] hover:text-white transition focus:outline-none focus:ring-2 focus:ring-[#6C5CE7] focus:ring-offset-2 rounded"
		>
			<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
			</svg>
		</button>
		<h1 class="text-lg font-semibold text-white lg:hidden">
			<span class="text-[#6C5CE7]">Metron</span>Lab
		</h1>
	</div>

	<div class="flex items-center gap-4">
		<span class="text-sm text-[#8B8BA7]">{user.displayName}</span>
		<form method="POST" action="/logout" use:enhance>
			<button
				type="submit"
				aria-label="로그아웃"
				class="text-sm text-[#8B8BA7] hover:text-[#FF6B6B] transition focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] focus:ring-offset-2 rounded px-2 py-1"
			>
				로그아웃
			</button>
		</form>
	</div>
</header>
