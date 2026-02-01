<script lang="ts">
	interface Props {
		title: string;
		value: string | number;
		subtitle?: string;
		icon?: string;
		color?: string;
	}

	let { title, value, subtitle, icon, color = '#6C5CE7' }: Props = $props();
</script>

<div class="bg-[#1A1A2E] rounded-xl p-5 border border-[#2A2A3E]">
	<div class="flex items-start justify-between">
		<div>
			<p class="text-sm text-[#8B8BA7]">{title}</p>
			<p class="text-2xl font-bold text-white mt-1">{value}</p>
			{#if subtitle}
				<p class="text-xs text-[#8B8BA7] mt-1">{subtitle}</p>
			{/if}
		</div>
		{#if icon}
			<div
				class="w-10 h-10 rounded-lg flex items-center justify-center"
				style="background-color: {color}20"
			>
				<svg class="w-5 h-5" style="color: {color}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={icon} />
				</svg>
			</div>
		{/if}
	</div>
</div>
