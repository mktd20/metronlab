<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let selectedInstrument = $state('');
	let contentType = $state('free');
	let bpm = $state(120);
	let notationMode = $state('tab');
	let timeSignature = $state('4/4');
	let generatingSheet = $state(false);
	let selectedAiSheetId = $state<string | null>(null);

	const contentTypes = [
		{ value: 'free', label: '자유 연습', desc: '메트로놈만으로 자유롭게' },
		{ value: 'scale', label: '스케일 연습', desc: '스케일/운지 트레이닝' },
		{ value: 'technique', label: '테크닉 연습', desc: '특정 기법 집중 연습' },
		{ value: 'song', label: '곡 연습', desc: '곡을 선택하여 연습' },
		{ value: 'ai_generated', label: 'AI 생성 악보', desc: 'AI가 맞춤형 악보 생성' }
	];

	async function generateAiSheet() {
		if (!selectedInstrument) {
			alert('먼저 악기를 선택해주세요.');
			return;
		}

		const instrument = data.instruments.find((i) => i.id === selectedInstrument);
		if (!instrument) return;

		generatingSheet = true;
		try {
			const response = await fetch('/api/ai/generate-sheet', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					instrument: instrument.type,
					generationParams: {
						focusArea: contentType === 'scale' ? 'scale' : 'auto',
						difficulty: 'adaptive',
						durationBars: 16,
						bpmSuggestion: true
					}
				})
			});

			if (!response.ok) {
				throw new Error('AI 악보 생성 실패');
			}

			const result = await response.json();
			selectedAiSheetId = result.sheetId;
			// Scale 연습일 때는 contentType을 유지하되 aiSheetId를 설정
			if (contentType === 'scale') {
				// contentType은 'scale'로 유지
			} else {
				contentType = 'ai_generated';
			}
			bpm = result.sheet.suggestedBpm || bpm;
			timeSignature = result.sheet.timeSignature || timeSignature;
		} catch (err) {
			console.error('Failed to generate sheet:', err);
			alert('AI 악보 생성에 실패했습니다. 다시 시도해주세요.');
		} finally {
			generatingSheet = false;
		}
	}

	const timeSignatures = ['4/4', '3/4', '6/8', '2/4', '5/4', '7/8'];
</script>

<svelte:head>
	<title>연습 시작 - MetronLab</title>
</svelte:head>

<div class="max-w-3xl mx-auto space-y-6">
	<h1 class="text-2xl font-bold text-white">연습 시작</h1>

	{#if form?.error}
		<div class="bg-red-500/10 border border-red-500/20 text-[#FF6B6B] px-4 py-3 rounded-lg text-sm">
			{form.error}
		</div>
	{/if}

	{#if data.instruments.length === 0}
		<div class="bg-[#1A1A2E] rounded-xl border border-[#2A2A3E] p-8 text-center">
			<p class="text-[#8B8BA7] mb-4">먼저 악기를 등록해주세요</p>
			<a href="/instruments" class="px-6 py-2 bg-[#6C5CE7] hover:bg-[#5A4BD6] text-white rounded-lg transition text-sm">
				악기 등록하기
			</a>
		</div>
	{:else}
		<form method="POST" action="?/start" use:enhance>
			{#if selectedAiSheetId}
				<input type="hidden" name="aiSheetId" value={selectedAiSheetId} />
			{/if}
			<!-- Instrument Selection -->
			<div class="bg-[#1A1A2E] rounded-xl border border-[#2A2A3E] p-6 mb-4">
				<h2 class="text-lg font-semibold text-white mb-4">1. 악기 선택</h2>
				<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
					{#each data.instruments as inst}
						<label
							class="cursor-pointer p-4 rounded-xl border text-center transition {selectedInstrument === inst.id
								? 'border-[#6C5CE7] bg-[#6C5CE7]/10'
								: 'border-[#2A2A3E] hover:border-[#6C5CE7]/30'}"
						>
							<input type="radio" name="instrumentId" value={inst.id} bind:group={selectedInstrument} class="sr-only" />
							<div class="w-10 h-10 mx-auto rounded-lg bg-[#6C5CE7]/10 flex items-center justify-center text-[#6C5CE7] text-lg font-bold mb-2">
								{inst.type.charAt(0).toUpperCase()}
							</div>
							<p class="text-sm font-medium text-white">{inst.name}</p>
							<p class="text-xs text-[#8B8BA7]">{inst.type}</p>
						</label>
					{/each}
				</div>
			</div>

			<!-- Practice Type -->
			<div class="bg-[#1A1A2E] rounded-xl border border-[#2A2A3E] p-6 mb-4">
				<h2 class="text-lg font-semibold text-white mb-4">2. 연습 유형</h2>
				<div class="grid grid-cols-2 gap-3">
					{#each contentTypes as ct}
						<label
							class="cursor-pointer p-4 rounded-xl border transition {contentType === ct.value
								? 'border-[#6C5CE7] bg-[#6C5CE7]/10'
								: 'border-[#2A2A3E] hover:border-[#6C5CE7]/30'}"
						>
							<input type="radio" name="contentType" value={ct.value} bind:group={contentType} class="sr-only" />
							<p class="text-sm font-medium text-white">{ct.label}</p>
							<p class="text-xs text-[#8B8BA7] mt-1">{ct.desc}</p>
						</label>
					{/each}
				</div>
				{#if contentType === 'ai_generated' || contentType === 'scale'}
					<div class="mt-4 p-4 bg-[#0A0A0F] rounded-lg">
						{#if generatingSheet}
							<div class="flex items-center gap-2 text-sm text-[#8B8BA7]">
								<svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
									<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
									<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
								</svg>
								{contentType === 'scale' ? 'AI 스케일 악보 생성 중...' : 'AI 악보 생성 중...'}
							</div>
						{:else if selectedAiSheetId}
							<p class="text-sm text-[#00B894]">✓ AI {contentType === 'scale' ? '스케일' : ''} 악보가 생성되었습니다</p>
						{:else}
							<button
								type="button"
								onclick={generateAiSheet}
								disabled={!selectedInstrument}
								class="w-full px-4 py-2 bg-[#6C5CE7] hover:bg-[#5A4BD6] text-white rounded-lg transition text-sm disabled:opacity-30 disabled:cursor-not-allowed"
							>
								{contentType === 'scale' ? 'AI 스케일 악보 생성하기' : 'AI 악보 생성하기'}
							</button>
						{/if}
					</div>
				{/if}
			</div>

			<!-- Settings -->
			<div class="bg-[#1A1A2E] rounded-xl border border-[#2A2A3E] p-6 mb-4">
				<h2 class="text-lg font-semibold text-white mb-4">3. 설정</h2>
				<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
					<div>
						<label for="bpm" class="block text-sm text-[#8B8BA7] mb-1.5">BPM: {bpm}</label>
						<input type="range" id="bpm" name="bpm" min="30" max="300" bind:value={bpm} class="w-full accent-[#6C5CE7]" />
					</div>
					<div>
						<label for="ts" class="block text-sm text-[#8B8BA7] mb-1.5">박자</label>
						<select name="timeSignature" id="ts" bind:value={timeSignature} class="w-full px-3 py-2 bg-[#0A0A0F] border border-[#2A2A3E] rounded-lg text-white text-sm focus:outline-none focus:border-[#6C5CE7]">
							{#each timeSignatures as ts}
								<option value={ts}>{ts}</option>
							{/each}
						</select>
					</div>
					<div>
						<label class="block text-sm text-[#8B8BA7] mb-1.5">악보 모드</label>
						<div class="flex gap-2">
							<label class="flex-1 cursor-pointer text-center py-2 rounded-lg border text-sm transition {notationMode === 'note' ? 'border-[#6C5CE7] bg-[#6C5CE7]/10 text-[#6C5CE7]' : 'border-[#2A2A3E] text-[#8B8BA7]'}">
								<input type="radio" name="notationMode" value="note" bind:group={notationMode} class="sr-only" />
								Note
							</label>
							<label class="flex-1 cursor-pointer text-center py-2 rounded-lg border text-sm transition {notationMode === 'tab' ? 'border-[#6C5CE7] bg-[#6C5CE7]/10 text-[#6C5CE7]' : 'border-[#2A2A3E] text-[#8B8BA7]'}">
								<input type="radio" name="notationMode" value="tab" bind:group={notationMode} class="sr-only" />
								Tab
							</label>
						</div>
					</div>
				</div>
			</div>

			<button
				type="submit"
				disabled={!selectedInstrument}
				class="w-full py-3 bg-[#6C5CE7] hover:bg-[#5A4BD6] text-white font-semibold rounded-xl transition disabled:opacity-30 disabled:cursor-not-allowed text-lg"
			>
				연습 시작
			</button>
		</form>
	{/if}
</div>
