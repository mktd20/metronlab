<script lang="ts">
	import { onMount, onDestroy } from 'svelte';

	let isListening = $state(false);
	let currentNote = $state<string | null>(null);
	let currentFrequency = $state(0);
	let cents = $state(0); // -50 to +50
	let audioContext: AudioContext | null = null;
	let analyser: AnalyserNode | null = null;
	let microphone: MediaStreamAudioSourceNode | null = null;
	let stream: MediaStream | null = null;
	let animationFrame: number | null = null;

	const NOTE_FREQUENCIES: Record<string, number> = {
		'C': 261.63,
		'C#': 277.18,
		'D': 293.66,
		'D#': 311.13,
		'E': 329.63,
		'F': 349.23,
		'F#': 369.99,
		'G': 392.00,
		'G#': 415.30,
		'A': 440.00,
		'A#': 466.16,
		'B': 493.88
	};

	const STANDARD_TUNINGS: Record<string, Record<string, number>> = {
		guitar: {
			'E2': 82.41,   // 6th string (low E)
			'A2': 110.00,  // 5th string
			'D3': 146.83,  // 4th string
			'G3': 196.00,  // 3rd string
			'B3': 246.94,  // 2nd string
			'E4': 329.63   // 1st string (high E)
		},
		bass: {
			'E1': 41.20,   // E1
			'A1': 55.00,   // A1
			'D2': 73.42,   // D2
			'G2': 98.00    // G2
		},
		ukulele: {
			'G4': 392.00,  // G4
			'C4': 261.63,  // C4
			'E4': 329.63,  // E4
			'A4': 440.00   // A4
		},
		violin: {
			'G3': 196.00,  // G3
			'D4': 293.66,  // D4
			'A4': 440.00,  // A4
			'E5': 659.25   // E5
		}
	};

	const TUNING_LABELS: Record<string, string[]> = {
		guitar: ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'],
		bass: ['E1', 'A1', 'D2', 'G2'],
		ukulele: ['G4', 'C4', 'E4', 'A4'],
		violin: ['G3', 'D4', 'A4', 'E5']
	};

	let selectedInstrument = $state('guitar');
	let selectedString = $state<string | null>(null);

	function getTargetFrequency(): number | null {
		if (!selectedString) return null;
		const tuning = STANDARD_TUNINGS[selectedInstrument];
		return tuning?.[selectedString] || null;
	}

	function getDisplayNote(stringLabel: string): string {
		// Extract note name from label (e.g., "E2" -> "E")
		return stringLabel.replace(/\d+$/, '');
	}

	function findClosestNote(frequency: number): { note: string; cents: number; targetFreq?: number } {
		// If a string is selected, compare to that string's target frequency
		const targetFreq = getTargetFrequency();
		if (targetFreq) {
			const centsDiff = 1200 * Math.log2(frequency / targetFreq);
			const note = selectedString || '?';
			return {
				note,
				cents: Math.max(-50, Math.min(50, Math.round(centsDiff))),
				targetFreq
			};
		}

		// Otherwise, find closest note across all octaves
		let closestNote = 'A';
		let minDiff = Infinity;
		let closestCents = 0;

		for (const [note, noteFreq] of Object.entries(NOTE_FREQUENCIES)) {
			// Check multiple octaves
			for (let octave = 2; octave <= 6; octave++) {
				const freq = noteFreq * Math.pow(2, octave - 4);
				const diff = Math.abs(frequency - freq);
				const centsDiff = 1200 * Math.log2(frequency / freq);

				if (diff < minDiff) {
					minDiff = diff;
					closestNote = note;
					closestCents = Math.round(centsDiff);
				}
			}
		}

		return { note: closestNote, cents: Math.max(-50, Math.min(50, closestCents)) };
	}

	async function startListening() {
		try {
			stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			audioContext = new AudioContext();
		analyser = audioContext.createAnalyser();
		analyser.fftSize = 8192; // Higher resolution for better pitch detection
		analyser.smoothingTimeConstant = 0.3;
		microphone = audioContext.createMediaStreamSource(stream);

			microphone.connect(analyser);
			isListening = true;

			detectPitch();
		} catch (err) {
			console.error('Error accessing microphone:', err);
			alert('마이크 접근 권한이 필요합니다.');
		}
	}

	function stopListening() {
		if (animationFrame) {
			cancelAnimationFrame(animationFrame);
			animationFrame = null;
		}
		if (stream) {
			stream.getTracks().forEach((track) => track.stop());
			stream = null;
		}
		if (audioContext) {
			audioContext.close();
			audioContext = null;
		}
		microphone = null;
		analyser = null;
		isListening = false;
		currentNote = null;
		currentFrequency = 0;
		cents = 0;
	}

	function detectPitch() {
		if (!analyser || !isListening || !audioContext) return;

		const bufferLength = analyser.frequencyBinCount;
		const dataArray = new Float32Array(bufferLength);
		analyser.getFloatTimeDomainData(dataArray);

		// Use autocorrelation for better pitch detection
		const sampleRate = audioContext.sampleRate;
		let bestPeriod = 0;
		let bestCorrelation = 0;

		// Search for period between 20Hz and 2000Hz
		const minPeriod = sampleRate / 2000;
		const maxPeriod = sampleRate / 20;

		for (let period = minPeriod; period < maxPeriod; period++) {
			let correlation = 0;
			for (let i = 0; i < bufferLength - period; i++) {
				correlation += dataArray[i] * dataArray[i + period];
			}
			if (correlation > bestCorrelation) {
				bestCorrelation = correlation;
				bestPeriod = period;
			}
		}

		if (bestPeriod > 0 && bestCorrelation > 0.1) {
			const frequency = sampleRate / bestPeriod;
			
			// Smooth the frequency reading
			if (currentFrequency === 0) {
				currentFrequency = frequency;
			} else {
				currentFrequency = currentFrequency * 0.7 + frequency * 0.3;
			}

			const result = findClosestNote(currentFrequency);
			currentNote = result.note;
			cents = result.cents;
		} else {
			// No clear signal detected
			if (currentFrequency > 0) {
				currentFrequency *= 0.95; // Fade out
				if (currentFrequency < 20) {
					currentNote = null;
					currentFrequency = 0;
					cents = 0;
				}
			}
		}

		animationFrame = requestAnimationFrame(detectPitch);
	}

	onDestroy(() => {
		stopListening();
	});
</script>

<div>

	<!-- Instrument Selection -->
	<div class="mb-4">
		<label for="instrument-select" class="block text-sm text-[#8B8BA7] mb-2">악기</label>
		<select
			id="instrument-select"
			bind:value={selectedInstrument}
			class="w-full px-3 py-2 bg-[#0A0A0F] border border-[#2A2A3E] rounded-lg text-white text-sm focus:outline-none focus:border-[#6C5CE7]"
		>
			{#each Object.keys(STANDARD_TUNINGS) as inst}
				<option value={inst}>{inst}</option>
			{/each}
		</select>
	</div>

	<!-- String Selection -->
	<div class="mb-4">
		<p class="block text-sm text-[#8B8BA7] mb-2">현 선택</p>
		<div class="flex gap-2 flex-wrap">
			{#each TUNING_LABELS[selectedInstrument] || [] as stringLabel, i}
				<button
					onclick={() => (selectedString = stringLabel)}
					class="px-4 py-2 rounded-lg text-sm transition {selectedString === stringLabel
						? 'bg-[#6C5CE7] text-white'
						: 'bg-[#0A0A0F] border border-[#2A2A3E] text-[#8B8BA7] hover:text-white'}"
				>
					{getDisplayNote(stringLabel)}
				</button>
			{/each}
		</div>
	</div>

	<!-- Tuner Display -->
	<div class="text-center mb-6">
		{#if currentNote}
			<div class="text-6xl font-bold text-white mb-2">{currentNote}</div>
			<div class="text-sm text-[#8B8BA7] mb-2">{Math.round(currentFrequency)} Hz</div>
			{#if selectedString && getTargetFrequency()}
				<div class="text-xs text-[#4A4A5E] mb-4">목표: {getDisplayNote(selectedString)} ({Math.round(getTargetFrequency()!)} Hz)</div>
			{/if}

			<!-- Needle Gauge -->
			<div class="relative w-full h-32 mb-4 overflow-hidden">
				<!-- Background with gradient -->
				<div class="absolute inset-0 border-2 border-[#2A2A3E] rounded-lg" style="background: linear-gradient(to right, rgba(255, 107, 107, 0.1), rgba(253, 203, 110, 0.1), rgba(0, 184, 148, 0.1));"></div>
				
				<!-- Center line -->
				<div class="absolute left-1/2 top-0 bottom-0 w-0.5 bg-[#6C5CE7] z-10"></div>
				
				<!-- Scale markers -->
				<div class="absolute top-0 bottom-0 left-[calc(50%-25%)] w-0.5 bg-[#2A2A3E]"></div>
				<div class="absolute top-0 bottom-0 left-[calc(50%-12.5%)] w-0.5 bg-[#2A2A3E]"></div>
				<div class="absolute top-0 bottom-0 left-[calc(50%+12.5%)] w-0.5 bg-[#2A2A3E]"></div>
				<div class="absolute top-0 bottom-0 left-[calc(50%+25%)] w-0.5 bg-[#2A2A3E]"></div>
				
				<!-- Needle (pivot at center bottom) -->
				<div
					class="absolute bottom-0 left-1/2 w-0.5 h-20 origin-bottom transition-transform duration-100 ease-out z-20"
					style="transform: translateX(-50%) rotate({cents * 1.8}deg); background: linear-gradient(to top, #00B894, #6C5CE7); border-radius: 0.25rem 0.25rem 0 0;"
				></div>
				
				<!-- Markers text -->
				<div class="absolute top-2 left-[calc(50%-25%)] transform -translate-x-1/2 text-xs text-[#8B8BA7]">-50</div>
				<div class="absolute top-2 left-[calc(50%-12.5%)] transform -translate-x-1/2 text-xs text-[#8B8BA7]">-25</div>
				<div class="absolute top-2 left-[calc(50%+12.5%)] transform -translate-x-1/2 text-xs text-[#8B8BA7]">+25</div>
				<div class="absolute top-2 left-[calc(50%+25%)] transform -translate-x-1/2 text-xs text-[#8B8BA7]">+50</div>
			</div>

			<!-- Cents Display -->
			<div class="text-lg font-semibold {Math.abs(cents) < 5 ? 'text-[#00B894]' : Math.abs(cents) < 20 ? 'text-[#FDCB6E]' : 'text-[#FF6B6B]'}">
				{cents > 0 ? '+' : ''}{cents} cents
			</div>
		{:else}
			<div class="text-4xl text-[#8B8BA7] mb-4">음표를 감지하지 못했습니다</div>
		{/if}
	</div>

	<!-- Control Button -->
	<button
		onclick={() => (isListening ? stopListening() : startListening())}
		class="w-full py-3 rounded-lg font-semibold transition {isListening
			? 'bg-[#FF6B6B] hover:bg-[#e55b5b] text-white'
			: 'bg-[#6C5CE7] hover:bg-[#5A4BD6] text-white'}"
	>
		{isListening ? '중지' : '시작'}
	</button>
</div>
