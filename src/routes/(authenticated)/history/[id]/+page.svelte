<script lang="ts">
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let s = $derived(data.practiceSession);

	function formatDuration(seconds: number): string {
		const h = Math.floor(seconds / 3600);
		const m = Math.floor((seconds % 3600) / 60);
		const sec = seconds % 60;
		if (h > 0) return `${h}시간 ${m}분 ${sec}초`;
		return `${m}분 ${sec}초`;
	}

	function formatDate(date: Date): string {
		return new Intl.DateTimeFormat('ko-KR', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		}).format(new Date(date));
	}

	async function handleDelete() {
		if (!confirm('이 연습 기록을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
			return;
		}

		const sessionId = data.practiceSession.id;
		const response = await fetch(`/api/practice/${sessionId}`, {
			method: 'DELETE'
		});

		if (response.ok) {
			goto('/history');
		} else {
			alert('삭제 중 오류가 발생했습니다.');
		}
	}

	async function handleShare() {
		const content = prompt('공유할 메시지를 입력하세요 (선택):');
		
		const response = await fetch('/api/social/feed', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				sessionId: data.practiceSession.id,
				content: content || null
			})
		});

		if (response.ok) {
			alert('피드에 공유되었습니다!');
		} else {
			alert('공유에 실패했습니다.');
		}
	}

	let quickTags = $derived((s.quickTags as string[]) || []);
</script>

<svelte:head>
	<title>연습 상세 - MetronLab</title>
</svelte:head>

<div class="max-w-3xl mx-auto space-y-6">
	<div class="flex items-center gap-4">
		<a href="/history" class="text-[#8B8BA7] hover:text-white transition" aria-label="연습 기록 목록으로 돌아가기">
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
			</svg>
		</a>
		<h1 class="text-2xl font-bold text-white">연습 상세</h1>
	</div>

	<!-- Session Info -->
	<div class="bg-[#1A1A2E] rounded-xl border border-[#2A2A3E] p-6">
		<div class="flex items-center gap-4 mb-4">
			<div class="w-12 h-12 rounded-lg bg-[#6C5CE7]/10 flex items-center justify-center text-[#6C5CE7] text-xl font-bold">
				{(data.instrument?.type || 'X').charAt(0).toUpperCase()}
			</div>
			<div>
				<h2 class="text-lg font-semibold text-white">
					{s.contentTitle || s.contentType}
				</h2>
				<p class="text-sm text-[#8B8BA7]">
					{data.instrument?.name} &middot; {formatDate(s.startedAt)}
				</p>
			</div>
		</div>

		<div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
			<div class="bg-[#0A0A0F] rounded-lg p-3 text-center">
				<p class="text-xs text-[#8B8BA7]">연습 시간</p>
				<p class="text-lg font-bold text-white">{formatDuration(s.durationSeconds)}</p>
			</div>
			<div class="bg-[#0A0A0F] rounded-lg p-3 text-center">
				<p class="text-xs text-[#8B8BA7]">BPM</p>
				<p class="text-lg font-bold text-white">{s.initialBpm} → {s.finalBpm}</p>
			</div>
			<div class="bg-[#0A0A0F] rounded-lg p-3 text-center">
				<p class="text-xs text-[#8B8BA7]">박자</p>
				<p class="text-lg font-bold text-white">{s.timeSignature}</p>
			</div>
			<div class="bg-[#0A0A0F] rounded-lg p-3 text-center">
				<p class="text-xs text-[#8B8BA7]">악보 모드</p>
				<p class="text-lg font-bold text-white">{s.notationMode}</p>
			</div>
		</div>
	</div>

	<!-- User Feedback -->
	{#if s.userComment || quickTags.length > 0 || s.satisfactionRating}
		<div class="bg-[#1A1A2E] rounded-xl border border-[#2A2A3E] p-6">
			<h3 class="text-md font-semibold text-white mb-3">연습 후기</h3>

			{#if s.satisfactionRating}
				<div class="mb-3">
					<span class="text-[#FDCB6E] text-lg">{'★'.repeat(s.satisfactionRating)}{'☆'.repeat(5 - s.satisfactionRating)}</span>
				</div>
			{/if}

			{#if s.userComment}
				<p class="text-sm text-[#8B8BA7] mb-3">"{s.userComment}"</p>
			{/if}

			{#if quickTags.length > 0}
				<div class="flex flex-wrap gap-2">
					{#each quickTags as tag}
						<span class="px-3 py-1 rounded-full text-xs border border-[#6C5CE7]/20 bg-[#6C5CE7]/10 text-[#6C5CE7]">
							#{tag}
						</span>
					{/each}
				</div>
			{/if}
		</div>
	{/if}

	<!-- Actions -->
	<div class="flex justify-end gap-3">
		<button
			onclick={handleShare}
			aria-label="피드에 공유"
			class="px-4 py-2 bg-[#6C5CE7] hover:bg-[#5A4BD6] text-white rounded-lg transition text-sm"
		>
			공유하기
		</button>
		<button
			onclick={handleDelete}
			aria-label="연습 기록 삭제"
			class="px-4 py-2 border border-[#FF6B6B]/20 text-[#FF6B6B] hover:bg-[#FF6B6B]/10 rounded-lg transition text-sm"
		>
			삭제
		</button>
	</div>
</div>
