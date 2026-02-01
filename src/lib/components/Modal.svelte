<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		open: boolean;
		onClose: () => void;
		title?: string;
		children: Snippet;
	}

	let { open, onClose, title, children }: Props = $props();
</script>

{#if open}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4">
		<!-- Overlay -->
		<button class="absolute inset-0 bg-black/60" onclick={onClose} aria-label="Close modal"></button>

		<!-- Content -->
		<div class="relative bg-[#1A1A2E] rounded-2xl border border-[#2A2A3E] w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
			{#if title}
				<div class="flex items-center justify-between px-6 py-4 border-b border-[#2A2A3E]">
					<h2 class="text-lg font-semibold text-white">{title}</h2>
					<button onclick={onClose} class="text-[#8B8BA7] hover:text-white transition" aria-label="Close modal">
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>
			{/if}
			<div class="p-6">
				{@render children()}
			</div>
		</div>
	</div>
{/if}
