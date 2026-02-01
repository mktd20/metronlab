<script lang="ts">
	import NoteView from './NoteView.svelte';
	import TabView from './TabView.svelte';

	interface Props {
		mode: 'note' | 'tab';
		instrumentType: string;
		bpm: number;
		timeSignature: string;
		tabData?: any;
		noteData?: any;
	}

	let { mode, instrumentType, bpm, timeSignature, tabData, noteData }: Props = $props();
</script>

<div class="bg-[#1A1A2E] rounded-xl border border-[#2A2A3E] p-6 min-h-[300px]">
	{#if mode === 'note'}
		<NoteView {instrumentType} {bpm} {timeSignature} {noteData} />
	{:else}
		<TabView {instrumentType} {bpm} {timeSignature} {tabData} />
	{/if}
</div>
