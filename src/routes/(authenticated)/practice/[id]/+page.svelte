<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import Metronome from '$lib/components/metronome/Metronome.svelte';
	import SheetDisplay from '$lib/components/notation/SheetDisplay.svelte';
	import PracticeCompleteModal from '$lib/components/practice/PracticeCompleteModal.svelte';
	import AudioRecorder from '$lib/components/practice/AudioRecorder.svelte';
	import BackingTrackPlayer from '$lib/components/practice/BackingTrackPlayer.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let bpm = $state(data.practiceSession.initialBpm);
	let isPlaying = $state(false);
	let notationMode = $state<'note' | 'tab'>(data.practiceSession.notationMode as 'note' | 'tab');
	let elapsedSeconds = $state(0);
	let showCompleteModal = $state(false);
	let sessionEnded = $state(!!data.practiceSession.endedAt);

	let timer: ReturnType<typeof setInterval> | null = null;

	$effect(() => {
		if (isPlaying && !timer) {
			timer = setInterval(() => {
				elapsedSeconds++;
			}, 1000);
		} else if (!isPlaying && timer) {
			clearInterval(timer);
			timer = null;
		}
		return () => {
			if (timer) clearInterval(timer);
		};
	});

	function formatTime(s: number): string {
		const h = Math.floor(s / 3600);
		const m = Math.floor((s % 3600) / 60);
		const sec = s % 60;
		const pad = (n: number) => n.toString().padStart(2, '0');
		return h > 0 ? `${pad(h)}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`;
	}

	async function handleStop() {
		isPlaying = false;

		// 1분 미만이면 경고만 표시
		if (elapsedSeconds < 60) {
			if (confirm('연습 시간이 1분 미만입니다. 기록으로 저장되지 않습니다. 정말 종료하시겠습니까?')) {
				const formData = new FormData();
				formData.set('durationSeconds', String(elapsedSeconds));
				formData.set('finalBpm', String(bpm));

				const response = await fetch(`?/end`, {
					method: 'POST',
					body: formData
				});

				if (response.ok) {
					goto('/dashboard');
				} else {
					const result = await response.json();
					alert(result.error || '연습 종료 중 오류가 발생했습니다.');
				}
			}
			return;
		}

		// End session via form submission
		const formData = new FormData();
		formData.set('durationSeconds', String(elapsedSeconds));
		formData.set('finalBpm', String(bpm));

		const response = await fetch(`?/end`, {
			method: 'POST',
			body: formData
		});

		if (!response.ok) {
			const result = await response.json();
			alert(result.error || '연습 종료 중 오류가 발생했습니다.');
			return;
		}

		sessionEnded = true;
		showCompleteModal = true;
	}

	async function handleCommentSave(commentData: { comment: string; quickTags: string[]; satisfactionRating: number | null }) {
		const formData = new FormData();
		formData.set('comment', commentData.comment);
		formData.set('quickTags', JSON.stringify(commentData.quickTags));
		if (commentData.satisfactionRating) {
			formData.set('satisfactionRating', String(commentData.satisfactionRating));
		}

		await fetch(`?/comment`, {
			method: 'POST',
			body: formData
		});

		showCompleteModal = false;
		goto('/dashboard');
	}
</script>

<svelte:head>
	<title>연습 중 - MetronLab</title>
</svelte:head>

<div class="max-w-4xl mx-auto space-y-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-xl font-bold text-white">
				{data.instrument?.name || '연습 중'}
			</h1>
			<p class="text-sm text-[#8B8BA7]">
				{data.practiceSession.contentType} &middot; {data.practiceSession.timeSignature}
			</p>
		</div>
		<div class="flex items-center gap-4">
			<!-- Timer -->
			<div class="text-2xl font-mono font-bold text-white tabular-nums">
				{formatTime(elapsedSeconds)}
			</div>
			{#if !sessionEnded}
				<button
					onclick={handleStop}
					class="px-4 py-2 bg-[#FF6B6B] hover:bg-[#e55b5b] text-white rounded-lg transition text-sm font-medium"
				>
					종료
				</button>
			{:else}
				<a href="/dashboard" class="px-4 py-2 bg-[#6C5CE7] hover:bg-[#5A4BD6] text-white rounded-lg transition text-sm">
					대시보드로
				</a>
			{/if}
		</div>
	</div>

	<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
		<!-- Left Column: Metronome & Tools -->
		<div class="space-y-4">
			<Metronome bind:bpm bind:isPlaying />
			<AudioRecorder
				onRecordingComplete={async (blob, duration) => {
					// TODO: Upload recording to server
					console.log('Recording complete:', blob, duration);
				}}
			/>
			<BackingTrackPlayer metronomeBpm={bpm} />
		</div>

		<!-- Notation Area (Right) -->
		<div class="lg:col-span-2 space-y-4">
			<!-- Mode Toggle -->
			<div class="flex items-center gap-2">
				<button
					onclick={() => (notationMode = 'note')}
					class="px-4 py-2 rounded-lg text-sm font-medium transition {notationMode === 'note'
						? 'bg-[#6C5CE7] text-white'
						: 'bg-[#1A1A2E] text-[#8B8BA7] border border-[#2A2A3E] hover:text-white'}"
				>
					Note
				</button>
				<button
					onclick={() => (notationMode = 'tab')}
					class="px-4 py-2 rounded-lg text-sm font-medium transition {notationMode === 'tab'
						? 'bg-[#6C5CE7] text-white'
						: 'bg-[#1A1A2E] text-[#8B8BA7] border border-[#2A2A3E] hover:text-white'}"
				>
					Tab
				</button>
			</div>

			<!-- Sheet Display -->
			<SheetDisplay
				mode={notationMode}
				instrumentType={data.instrument?.type || 'guitar'}
				{bpm}
				timeSignature={data.practiceSession.timeSignature}
				tabData={data.aiSheet?.tabData}
				noteData={data.aiSheet?.noteData}
			/>
		</div>
	</div>
</div>

<PracticeCompleteModal
	open={showCompleteModal}
	onClose={() => { showCompleteModal = false; goto('/dashboard'); }}
	onSave={handleCommentSave}
	durationSeconds={elapsedSeconds}
	{bpm}
/>
