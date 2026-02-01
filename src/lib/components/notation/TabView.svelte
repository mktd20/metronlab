<script lang="ts">
	interface Props {
		instrumentType: string;
		bpm: number;
		timeSignature: string;
		tabData?: {
			measures: Array<{
				bar: number;
				strings: {
					[key: string]: string[];
				};
			}>;
		};
	}

	let { instrumentType, bpm, timeSignature, tabData }: Props = $props();

	const stringConfigs: Record<string, string[]> = {
		guitar: ['e', 'B', 'G', 'D', 'A', 'E'],
		bass: ['G', 'D', 'A', 'E'],
		violin: ['E', 'A', 'D', 'G'],
		ukulele: ['A', 'E', 'C', 'G'],
		default: ['1', '2', '3', '4', '5', '6']
	};

	let strings = $derived(stringConfigs[instrumentType] || stringConfigs.default);

	function renderTabLine(stringName: string, measures: any[]): string {
		if (!measures || measures.length === 0) {
			return '|----|----|----|----|----|----|----|----|';
		}

		let line = '|';
		for (const measure of measures) {
			const stringData = measure.strings[stringName] || [];
			if (stringData.length === 0) {
				line += '----|';
			} else {
				// Join notes with spaces and pad to 4 chars
				const measureStr = stringData.map((note: string) => note.padStart(2, ' ')).join('');
				line += measureStr.padEnd(4, '-') + '|';
			}
		}
		return line;
	}
</script>

<div class="space-y-4">
	<div class="flex items-center justify-between text-sm">
		<span class="text-[#8B8BA7]">Tablature</span>
		<span class="text-[#8B8BA7]">{timeSignature} &middot; {bpm} BPM</span>
	</div>

	<!-- Tab Lines -->
	<div class="font-mono text-sm overflow-x-auto">
		{#if tabData && tabData.measures && tabData.measures.length > 0}
			{#each strings as str}
				<div class="flex items-center">
					<span class="w-6 text-[#6C5CE7] font-bold text-right mr-2">{str}</span>
					<span class="text-white flex-1 whitespace-nowrap">{renderTabLine(str, tabData.measures)}</span>
				</div>
			{/each}
		{:else}
			{#each strings as str}
				<div class="flex items-center">
					<span class="w-6 text-[#6C5CE7] font-bold text-right mr-2">{str}</span>
					<span class="text-[#2A2A3E] flex-1">|----|----|----|----|----|----|----|----|</span>
				</div>
			{/each}
			<div class="text-center text-[#8B8BA7] text-sm mt-4">
				<p>타브 악보 표시 영역</p>
				<p class="text-xs text-[#4A4A5E] mt-1">AI 악보를 생성하면 여기에 표시됩니다</p>
			</div>
		{/if}
	</div>
</div>
