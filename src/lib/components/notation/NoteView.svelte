<script lang="ts">
	interface Props {
		instrumentType: string;
		bpm: number;
		timeSignature: string;
	}

	let { instrumentType, bpm, timeSignature }: Props = $props();
</script>

<div class="space-y-4">
	<div class="flex items-center justify-between text-sm">
		<span class="text-[#8B8BA7]">Standard Notation</span>
		<span class="text-[#8B8BA7]">{timeSignature} &middot; {bpm} BPM</span>
	</div>

	<!-- Staff Lines (Placeholder) -->
	<div class="relative py-8">
		{#each [0, 1, 2, 3, 4] as line}
			<div
				class="absolute left-0 right-0 h-px bg-[#2A2A3E]"
				style="top: {20 + line * 15}%"
			></div>
		{/each}

		<!-- Clef placeholder -->
		<div class="absolute left-4 top-1/2 -translate-y-1/2 text-4xl text-[#4A4A5E]">
			{instrumentType === 'bass' ? '?' : '&'}
		</div>

		<div class="text-center text-[#8B8BA7] text-sm pt-20">
			<p>오선보 표시 영역</p>
			<p class="text-xs text-[#4A4A5E] mt-1">VexFlow 연동 후 악보가 렌더링됩니다 (Phase 2)</p>
		</div>
	</div>
</div>
