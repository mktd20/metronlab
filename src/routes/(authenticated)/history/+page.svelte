<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	function formatDuration(seconds: number): string {
		const h = Math.floor(seconds / 3600);
		const m = Math.floor((seconds % 3600) / 60);
		if (h > 0) return `${h}시간 ${m}분`;
		return `${m}분`;
	}

	function formatDate(date: Date): string {
		return new Intl.DateTimeFormat('ko-KR', {
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		}).format(new Date(date));
	}
</script>

<svelte:head>
	<title>연습 기록 - MetronLab</title>
</svelte:head>

<div class="space-y-6">
	<h1 class="text-2xl font-bold text-white">연습 기록</h1>

	{#if data.sessions.length > 0}
		<div class="space-y-3">
			{#each data.sessions as session}
				<a
					href="/history/{session.id}"
					class="block bg-[#1A1A2E] rounded-xl border border-[#2A2A3E] p-5 hover:border-[#6C5CE7]/30 transition"
				>
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-4">
							<div class="w-10 h-10 rounded-lg bg-[#6C5CE7]/10 flex items-center justify-center text-[#6C5CE7] font-bold">
								{(session.instrumentType || 'X').charAt(0).toUpperCase()}
							</div>
							<div>
								<p class="font-medium text-white">
									{session.contentTitle || session.contentType}
								</p>
								<p class="text-sm text-[#8B8BA7]">
									{session.instrumentName || session.instrumentType} &middot; {formatDate(session.startedAt)} &middot; {formatDuration(session.durationSeconds)}
								</p>
								{#if session.userComment}
									<p class="text-xs text-[#4A4A5E] mt-1 line-clamp-1">"{session.userComment}"</p>
								{/if}
							</div>
						</div>
						<div class="text-right shrink-0">
							<p class="text-sm font-medium text-[#6C5CE7]">{session.initialBpm} BPM</p>
							<p class="text-xs text-[#8B8BA7]">{session.notationMode}</p>
							{#if session.satisfactionRating}
								<p class="text-xs text-[#FDCB6E]">{'★'.repeat(session.satisfactionRating)}</p>
							{/if}
						</div>
					</div>
				</a>
			{/each}
		</div>
	{:else}
		<div class="bg-[#1A1A2E] rounded-xl border border-[#2A2A3E] p-12 text-center">
			<p class="text-[#8B8BA7] text-lg mb-2">아직 연습 기록이 없습니다</p>
			<p class="text-[#4A4A5E] text-sm mb-4">첫 연습을 시작해보세요!</p>
			<a href="/practice" class="inline-block px-6 py-2 bg-[#6C5CE7] hover:bg-[#5A4BD6] text-white rounded-lg transition text-sm">
				연습 시작하기
			</a>
		</div>
	{/if}
</div>
