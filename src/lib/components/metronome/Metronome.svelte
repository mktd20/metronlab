<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { MetronomeEngine } from './metronome-engine';

	interface Props {
		bpm: number;
		beatsPerMeasure?: number;
		isPlaying: boolean;
		onBpmChange?: (bpm: number) => void;
	}

	let { bpm = $bindable(120), beatsPerMeasure = 4, isPlaying = $bindable(false), onBpmChange }: Props = $props();

	let engine: MetronomeEngine | null = null;
	let currentBeat = $state(-1);
	let beatIndicators = $derived(Array.from({ length: beatsPerMeasure }, (_, i) => i));

	onMount(() => {
		engine = new MetronomeEngine();
		engine.onBeat = (beat, _isAccent) => {
			currentBeat = beat;
		};
		// Initialize audio context on user interaction
		engine.initAudioContext().catch(console.error);
	});

	onDestroy(() => {
		engine?.destroy();
	});

	$effect(() => {
		if (engine) {
			engine.bpm = bpm;
			engine.beatsPerMeasure = beatsPerMeasure;
		}
	});

	$effect(() => {
		if (!engine) return;
		if (isPlaying && !engine.isPlaying) {
			// Ensure audio context is initialized before starting
			engine.initAudioContext().then(() => {
				engine?.start();
			}).catch(console.error);
		} else if (!isPlaying && engine.isPlaying) {
			engine.stop();
			currentBeat = -1;
		}
	});

	function adjustBpm(delta: number) {
		const newBpm = Math.max(30, Math.min(300, bpm + delta));
		bpm = newBpm;
		onBpmChange?.(newBpm);
	}
</script>

<div class="bg-[#1A1A2E] rounded-xl border border-[#2A2A3E] p-6">
	<!-- Beat Indicators -->
	<div class="flex items-center justify-center gap-3 mb-6">
		{#each beatIndicators as beat}
			<div
				class="w-6 h-6 rounded-full transition-all duration-100 {currentBeat === beat
					? beat === 0
						? 'bg-[#6C5CE7] scale-125 shadow-lg shadow-[#6C5CE7]/30'
						: 'bg-[#00B894] scale-110'
					: 'bg-[#2A2A3E]'}"
			></div>
		{/each}
	</div>

	<!-- BPM Display -->
	<div class="text-center mb-4">
		<div class="text-5xl font-bold text-white tabular-nums">{bpm}</div>
		<div class="text-sm text-[#8B8BA7] mt-1">BPM</div>
	</div>

	<!-- BPM Controls -->
	<div class="flex items-center justify-center gap-3 mb-4">
		<button onclick={() => adjustBpm(-5)} class="w-10 h-10 rounded-lg bg-[#0A0A0F] border border-[#2A2A3E] text-[#8B8BA7] hover:text-white hover:border-[#6C5CE7] transition text-lg">-5</button>
		<button onclick={() => adjustBpm(-1)} class="w-10 h-10 rounded-lg bg-[#0A0A0F] border border-[#2A2A3E] text-[#8B8BA7] hover:text-white hover:border-[#6C5CE7] transition text-lg">-1</button>
		<input
			type="range"
			min="30"
			max="300"
			bind:value={bpm}
			oninput={() => onBpmChange?.(bpm)}
			class="flex-1 max-w-48 accent-[#6C5CE7]"
		/>
		<button onclick={() => adjustBpm(1)} class="w-10 h-10 rounded-lg bg-[#0A0A0F] border border-[#2A2A3E] text-[#8B8BA7] hover:text-white hover:border-[#6C5CE7] transition text-lg">+1</button>
		<button onclick={() => adjustBpm(5)} class="w-10 h-10 rounded-lg bg-[#0A0A0F] border border-[#2A2A3E] text-[#8B8BA7] hover:text-white hover:border-[#6C5CE7] transition text-lg">+5</button>
	</div>

	<!-- Play/Stop -->
	<div class="flex justify-center">
		<button
			onclick={() => (isPlaying = !isPlaying)}
			class="w-16 h-16 rounded-full flex items-center justify-center transition {isPlaying
				? 'bg-[#FF6B6B] hover:bg-[#e55b5b]'
				: 'bg-[#6C5CE7] hover:bg-[#5A4BD6]'}"
		>
			{#if isPlaying}
				<svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
					<rect x="6" y="4" width="4" height="16" rx="1" />
					<rect x="14" y="4" width="4" height="16" rx="1" />
				</svg>
			{:else}
				<svg class="w-7 h-7 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
					<path d="M8 5v14l11-7z" />
				</svg>
			{/if}
		</button>
	</div>
</div>
