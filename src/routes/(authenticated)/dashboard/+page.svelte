<script lang="ts">
	import SummaryCard from '$lib/components/SummaryCard.svelte';
	import TrendChart from '$lib/components/charts/TrendChart.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	function formatDuration(seconds: number): string {
		const h = Math.floor(seconds / 3600);
		const m = Math.floor((seconds % 3600) / 60);
		if (h > 0) return `${h}시간 ${m}분`;
		return `${m}분`;
	}

	function formatDate(dateStr: string): string {
		const d = new Date(dateStr);
		return `${d.getMonth() + 1}/${d.getDate()}`;
	}
</script>

<svelte:head>
	<title>대시보드 - MetronLab</title>
</svelte:head>

<div class="space-y-6">
	<!-- Quick Actions -->
	<div class="flex items-center justify-between">
		<h1 class="text-2xl font-bold text-white">대시보드</h1>
		<a
			href="/practice"
			class="px-6 py-2.5 bg-[#6C5CE7] hover:bg-[#5A4BD6] text-white font-semibold rounded-xl transition flex items-center gap-2"
		>
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
			</svg>
			연습 시작
		</a>
	</div>

	<!-- Summary Cards -->
	<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
		<SummaryCard
			title="오늘 연습"
			value="{data.summary.todayMinutes}분"
			icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
			color="#6C5CE7"
		/>
		<SummaryCard
			title="이번 주"
			value="{data.summary.weekMinutes}분"
			icon="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
			color="#00B894"
		/>
		<SummaryCard
			title="연속 연습"
			value="{data.summary.streak}일"
			subtitle="Keep it up!"
			icon="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"
			color="#FD79A8"
		/>
		<SummaryCard
			title="총 세션"
			value="{data.summary.totalSessions}회"
			icon="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
			color="#FDCB6E"
		/>
	</div>

	<!-- Trend Chart -->
	<div class="bg-[#1A1A2E] rounded-xl border border-[#2A2A3E] p-6">
		<h2 class="text-lg font-semibold text-white mb-4">연습 트렌드 (최근 30일)</h2>
		{#if data.trendData.length > 0}
			<TrendChart data={data.trendData} />
		{:else}
			<div class="h-48 flex items-center justify-center text-[#8B8BA7]">
				연습 데이터가 없습니다. 첫 연습을 시작해보세요!
			</div>
		{/if}
	</div>

	<!-- Instruments & Recent Sessions -->
	<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
		<!-- My Instruments -->
		<div class="bg-[#1A1A2E] rounded-xl border border-[#2A2A3E] p-6">
			<div class="flex items-center justify-between mb-4">
				<h2 class="text-lg font-semibold text-white">내 악기</h2>
				<a href="/instruments" class="text-sm text-[#6C5CE7] hover:underline">관리</a>
			</div>
			{#if data.instruments.length > 0}
				<div class="space-y-3">
					{#each data.instruments as inst}
						<div class="flex items-center gap-3 p-3 bg-[#0A0A0F] rounded-lg">
							<div class="w-10 h-10 rounded-lg bg-[#6C5CE7]/10 flex items-center justify-center text-[#6C5CE7] text-sm font-bold">
								{inst.type.charAt(0).toUpperCase()}
							</div>
							<div>
								<p class="text-sm font-medium text-white">{inst.name}</p>
								<p class="text-xs text-[#8B8BA7]">{inst.type}</p>
							</div>
						</div>
					{/each}
				</div>
			{:else}
				<p class="text-sm text-[#8B8BA7]">등록된 악기가 없습니다. <a href="/instruments" class="text-[#6C5CE7] hover:underline">악기를 추가</a>해주세요.</p>
			{/if}
		</div>

		<!-- Recent Sessions -->
		<div class="bg-[#1A1A2E] rounded-xl border border-[#2A2A3E] p-6">
			<div class="flex items-center justify-between mb-4">
				<h2 class="text-lg font-semibold text-white">최근 연습</h2>
				<a href="/history" class="text-sm text-[#6C5CE7] hover:underline">전체 보기</a>
			</div>
			{#if data.recentSessions.length > 0}
				<div class="space-y-3">
					{#each data.recentSessions as session}
						<a href="/history/{session.id}" class="block p-3 bg-[#0A0A0F] rounded-lg hover:bg-[#222240] transition">
							<div class="flex items-center justify-between">
								<div>
									<p class="text-sm font-medium text-white">
										{session.contentTitle || session.contentType}
									</p>
									<p class="text-xs text-[#8B8BA7]">
										{session.instrumentName || session.instrumentType} &middot; {formatDate(session.startedAt.toISOString())} &middot; {formatDuration(session.durationSeconds)}
									</p>
								</div>
								<div class="text-right">
									<p class="text-sm font-medium text-[#6C5CE7]">{session.initialBpm} BPM</p>
									{#if session.satisfactionRating}
										<p class="text-xs text-[#FDCB6E]">{'★'.repeat(session.satisfactionRating)}</p>
									{/if}
								</div>
							</div>
						</a>
					{/each}
				</div>
			{:else}
				<p class="text-sm text-[#8B8BA7]">아직 연습 기록이 없습니다.</p>
			{/if}
		</div>
	</div>
</div>
