<script lang="ts">
	import { onMount, onDestroy } from 'svelte';

	interface Props {
		onRecordingComplete?: (blob: Blob, duration: number) => void;
	}

	let { onRecordingComplete }: Props = $props();

	let isRecording = $state(false);
	let isPaused = $state(false);
	let duration = $state(0);
	let mediaRecorder: MediaRecorder | null = null;
	let audioChunks: Blob[] = [];
	let stream: MediaStream | null = null;
	let timer: ReturnType<typeof setInterval> | null = null;

	onMount(() => {
		return () => {
			stopRecording();
		};
	});

	async function startRecording() {
		try {
			stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			mediaRecorder = new MediaRecorder(stream);
			audioChunks = [];

			mediaRecorder.ondataavailable = (event) => {
				if (event.data.size > 0) {
					audioChunks.push(event.data);
				}
			};

			mediaRecorder.onstop = () => {
				const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
				onRecordingComplete?.(audioBlob, duration);
			};

			mediaRecorder.start();
			isRecording = true;
			isPaused = false;
			duration = 0;

			timer = setInterval(() => {
				if (!isPaused) {
					duration++;
				}
			}, 1000);
		} catch (err) {
			console.error('Error accessing microphone:', err);
			alert('마이크 접근 권한이 필요합니다.');
		}
	}

	function pauseRecording() {
		if (mediaRecorder && isRecording) {
			mediaRecorder.pause();
			isPaused = true;
		}
	}

	function resumeRecording() {
		if (mediaRecorder && isRecording && isPaused) {
			mediaRecorder.resume();
			isPaused = false;
		}
	}

	function stopRecording() {
		if (timer) {
			clearInterval(timer);
			timer = null;
		}
		if (mediaRecorder && isRecording) {
			mediaRecorder.stop();
			isRecording = false;
			isPaused = false;
		}
		if (stream) {
			stream.getTracks().forEach((track) => track.stop());
			stream = null;
		}
	}

	function formatTime(seconds: number): string {
		const m = Math.floor(seconds / 60);
		const s = seconds % 60;
		return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
	}
</script>

<div class="bg-[#1A1A2E] rounded-xl border border-[#2A2A3E] p-6">
	<h3 class="text-lg font-semibold text-white mb-4">녹음</h3>

	<div class="text-center mb-4">
		<div class="text-3xl font-mono font-bold text-white tabular-nums mb-2">
			{formatTime(duration)}
		</div>
		{#if isRecording}
			<div class="flex items-center justify-center gap-2 text-sm text-[#FF6B6B]">
				<div class="w-2 h-2 rounded-full bg-[#FF6B6B] animate-pulse"></div>
				녹음 중...
			</div>
		{/if}
	</div>

	<div class="flex items-center justify-center gap-3">
		{#if !isRecording}
			<button
				onclick={startRecording}
				class="px-6 py-3 bg-[#6C5CE7] hover:bg-[#5A4BD6] text-white rounded-lg transition font-medium"
			>
				시작
			</button>
		{:else}
			{#if isPaused}
				<button
					onclick={resumeRecording}
					class="px-4 py-2 bg-[#00B894] hover:bg-[#00a085] text-white rounded-lg transition"
				>
					재개
				</button>
			{:else}
				<button
					onclick={pauseRecording}
					class="px-4 py-2 bg-[#FDCB6E] hover:bg-[#f0b94d] text-white rounded-lg transition"
				>
					일시정지
				</button>
			{/if}
			<button
				onclick={stopRecording}
				class="px-4 py-2 bg-[#FF6B6B] hover:bg-[#e55b5b] text-white rounded-lg transition"
			>
				중지
			</button>
		{/if}
	</div>
</div>
