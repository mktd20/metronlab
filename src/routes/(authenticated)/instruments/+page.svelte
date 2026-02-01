<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let showForm = $state(false);

	const instrumentTypes = [
		{ value: 'guitar', label: 'Guitar' },
		{ value: 'bass', label: 'Bass' },
		{ value: 'drums', label: 'Drums' },
		{ value: 'keyboard', label: 'Keyboard' },
		{ value: 'piano', label: 'Piano' },
		{ value: 'violin', label: 'Violin' },
		{ value: 'ukulele', label: 'Ukulele' },
		{ value: 'vocal', label: 'Vocal' }
	];
</script>

<svelte:head>
	<title>악기 관리 - MetronLab</title>
</svelte:head>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<h1 class="text-2xl font-bold text-white">악기 관리</h1>
		<button
			onclick={() => (showForm = !showForm)}
			class="px-4 py-2 bg-[#6C5CE7] hover:bg-[#5A4BD6] text-white rounded-lg transition text-sm"
		>
			{showForm ? '취소' : '+ 악기 추가'}
		</button>
	</div>

	{#if form?.error}
		<div class="bg-red-500/10 border border-red-500/20 text-[#FF6B6B] px-4 py-3 rounded-lg text-sm">
			{form.error}
		</div>
	{/if}

	{#if showForm}
		<form
			method="POST"
			action="?/create"
			use:enhance={() => {
				return async ({ update }) => {
					await update();
					showForm = false;
				};
			}}
			class="bg-[#1A1A2E] rounded-xl border border-[#2A2A3E] p-6"
		>
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<div>
					<label for="type" class="block text-sm text-[#8B8BA7] mb-1.5">악기 종류</label>
					<select
						id="type"
						name="type"
						required
						class="w-full px-4 py-2.5 bg-[#0A0A0F] border border-[#2A2A3E] rounded-lg text-white focus:outline-none focus:border-[#6C5CE7]"
					>
						{#each instrumentTypes as t}
							<option value={t.value}>{t.label}</option>
						{/each}
					</select>
				</div>
				<div>
					<label for="name" class="block text-sm text-[#8B8BA7] mb-1.5">이름</label>
					<input
						id="name"
						name="name"
						type="text"
						required
						placeholder="예: My Fender Strat"
						class="w-full px-4 py-2.5 bg-[#0A0A0F] border border-[#2A2A3E] rounded-lg text-white placeholder-[#4A4A5E] focus:outline-none focus:border-[#6C5CE7]"
					/>
				</div>
			</div>
			<button
				type="submit"
				class="mt-4 px-6 py-2 bg-[#6C5CE7] hover:bg-[#5A4BD6] text-white rounded-lg transition text-sm"
			>
				추가
			</button>
		</form>
	{/if}

	<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
		{#each data.instruments as inst}
			<div class="bg-[#1A1A2E] rounded-xl border border-[#2A2A3E] p-5 flex items-start justify-between">
				<div class="flex items-center gap-3">
					<div class="w-12 h-12 rounded-lg bg-[#6C5CE7]/10 flex items-center justify-center text-[#6C5CE7] text-lg font-bold">
						{inst.type.charAt(0).toUpperCase()}
					</div>
					<div>
						<p class="font-medium text-white">{inst.name}</p>
						<p class="text-sm text-[#8B8BA7]">{inst.type}</p>
					</div>
				</div>
				<form method="POST" action="?/delete" use:enhance>
					<input type="hidden" name="id" value={inst.id} />
					<button type="submit" class="text-[#8B8BA7] hover:text-[#FF6B6B] transition">
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
						</svg>
					</button>
				</form>
			</div>
		{:else}
			<div class="col-span-full text-center py-12 text-[#8B8BA7]">
				<p class="text-lg mb-2">아직 등록된 악기가 없습니다</p>
				<p class="text-sm">위의 "+ 악기 추가" 버튼으로 악기를 등록해보세요</p>
			</div>
		{/each}
	</div>
</div>
