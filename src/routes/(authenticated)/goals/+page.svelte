<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let showGoalForm = $state(false);
	let showRoutineForm = $state(false);

	async function deleteGoal(id: string) {
		if (!confirm('이 목표를 삭제하시겠습니까?')) return;

		const response = await fetch(`/api/goals/${id}`, {
			method: 'DELETE'
		});

		if (response.ok) {
			window.location.reload();
		}
	}
</script>

<svelte:head>
	<title>목표 & 루틴 - MetronLab</title>
</svelte:head>

<div class="space-y-6">
	<h1 class="text-2xl font-bold text-white">목표 & 루틴</h1>

	<!-- Goals Section -->
	<div class="bg-[#1A1A2E] rounded-xl border border-[#2A2A3E] p-6">
		<div class="flex items-center justify-between mb-4">
			<h2 class="text-lg font-semibold text-white">연습 목표</h2>
			<button
				onclick={() => (showGoalForm = !showGoalForm)}
				class="px-4 py-2 bg-[#6C5CE7] hover:bg-[#5A4BD6] text-white rounded-lg transition text-sm"
			>
				+ 목표 추가
			</button>
		</div>

		{#if showGoalForm}
			<form
				method="POST"
				action="?/create"
				use:enhance={() => {
					return async ({ update }) => {
						await update();
						showGoalForm = false;
					};
				}}
				class="mb-4 space-y-3"
			>
				<div class="grid grid-cols-2 gap-3">
					<div>
						<label class="block text-sm text-[#8B8BA7] mb-1">기간</label>
						<select name="type" required class="w-full px-3 py-2 bg-[#0A0A0F] border border-[#2A2A3E] rounded-lg text-white text-sm">
							<option value="daily">일간</option>
							<option value="weekly">주간</option>
							<option value="monthly">월간</option>
						</select>
					</div>
					<div>
						<label class="block text-sm text-[#8B8BA7] mb-1">목표 유형</label>
						<select name="targetType" required class="w-full px-3 py-2 bg-[#0A0A0F] border border-[#2A2A3E] rounded-lg text-white text-sm">
							<option value="time">시간 (분)</option>
							<option value="sessions">세션 수</option>
							<option value="bpm">BPM 달성</option>
						</select>
					</div>
				</div>
				<div>
					<label class="block text-sm text-[#8B8BA7] mb-1">목표 값</label>
					<input
						type="number"
						name="targetValue"
						required
						min="1"
						class="w-full px-3 py-2 bg-[#0A0A0F] border border-[#2A2A3E] rounded-lg text-white text-sm"
					/>
				</div>
				<div>
					<label class="block text-sm text-[#8B8BA7] mb-1">설명 (선택)</label>
					<input
						type="text"
						name="description"
						class="w-full px-3 py-2 bg-[#0A0A0F] border border-[#2A2A3E] rounded-lg text-white text-sm"
					/>
				</div>
				<div class="flex gap-2">
					<button type="submit" class="px-4 py-2 bg-[#6C5CE7] hover:bg-[#5A4BD6] text-white rounded-lg transition text-sm">
						추가
					</button>
					<button type="button" onclick={() => (showGoalForm = false)} class="px-4 py-2 border border-[#2A2A3E] text-[#8B8BA7] rounded-lg transition text-sm">
						취소
					</button>
				</div>
			</form>
		{/if}

		{#if form?.error}
			<div class="bg-red-500/10 border border-red-500/20 text-[#FF6B6B] px-4 py-3 rounded-lg mb-4 text-sm">
				{form.error}
			</div>
		{/if}

		{#if data.goals.length > 0}
			<div class="space-y-3">
				{#each data.goals as goal}
					<div class="bg-[#0A0A0F] rounded-lg p-4">
						<div class="flex items-center justify-between mb-2">
							<div>
								<p class="text-sm font-medium text-white">{goal.description || `${goal.type} 목표`}</p>
								<p class="text-xs text-[#8B8BA7]">
									{goal.targetType === 'time' ? '시간' : goal.targetType === 'sessions' ? '세션' : 'BPM'}: {goal.targetValue}
									{goal.targetType === 'time' ? '분' : goal.targetType === 'sessions' ? '회' : ''}
								</p>
								{#if goal.progress}
									<p class="text-xs text-[#4A4A5E] mt-1">
										진행: {goal.progress.current} / {goal.progress.target}
										{#if goal.progress.isAchieved}
											<span class="text-[#00B894] ml-2">✓ 달성!</span>
										{/if}
									</p>
								{/if}
							</div>
							<button
								onclick={() => deleteGoal(goal.id)}
								class="text-[#8B8BA7] hover:text-[#FF6B6B] transition"
								aria-label="목표 삭제"
							>
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
								</svg>
							</button>
						</div>
						<div class="w-full bg-[#2A2A3E] rounded-full h-2">
							<div
								class="h-2 rounded-full transition-all {goal.progress?.isAchieved ? 'bg-[#00B894]' : 'bg-[#6C5CE7]'}"
								style="width: {Math.min(100, (goal.progress?.percentage || 0))}%"
							></div>
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<p class="text-sm text-[#8B8BA7] text-center py-4">목표가 없습니다. 목표를 추가해보세요!</p>
		{/if}
	</div>

	<!-- Routines Section -->
	<div class="bg-[#1A1A2E] rounded-xl border border-[#2A2A3E] p-6">
		<div class="flex items-center justify-between mb-4">
			<h2 class="text-lg font-semibold text-white">연습 루틴</h2>
			<button
				onclick={() => (showRoutineForm = !showRoutineForm)}
				class="px-4 py-2 bg-[#6C5CE7] hover:bg-[#5A4BD6] text-white rounded-lg transition text-sm"
			>
				+ 루틴 추가
			</button>
		</div>

		{#if data.routines.length > 0}
			<div class="space-y-3">
				{#each data.routines as routine}
					<div class="bg-[#0A0A0F] rounded-lg p-4">
						<h3 class="text-sm font-medium text-white mb-2">{routine.name}</h3>
						{#if routine.description}
							<p class="text-xs text-[#8B8BA7] mb-2">{routine.description}</p>
						{/if}
						{#if routine.items && routine.items.length > 0}
							<div class="space-y-1">
								{#each routine.items as item}
									<div class="text-xs text-[#4A4A5E]">
										{item.order + 1}. {item.title} ({Math.floor(item.durationSeconds / 60)}분)
									</div>
								{/each}
							</div>
						{/if}
					</div>
				{/each}
			</div>
		{:else}
			<p class="text-sm text-[#8B8BA7] text-center py-4">루틴이 없습니다. 루틴을 추가해보세요!</p>
		{/if}
	</div>
</div>
