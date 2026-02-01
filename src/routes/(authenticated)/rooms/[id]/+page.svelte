<script lang="ts">
	import { goto } from '$app/navigation';
	import Metronome from '$lib/components/metronome/Metronome.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let bpm = $state(data.room.currentBpm);
	let isPlaying = $state(false);

	async function joinRoom() {
		const response = await fetch(`/api/rooms/${data.room.id}`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ action: 'join' })
		});

		if (response.ok) {
			window.location.reload();
		} else {
			alert('방 참여에 실패했습니다.');
		}
	}

	async function leaveRoom() {
		if (!confirm('정말 방을 나가시겠습니까?')) return;

		const response = await fetch(`/api/rooms/${data.room.id}`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ action: 'leave' })
		});

		if (response.ok) {
			goto('/rooms');
		}
	}
</script>

<svelte:head>
	<title>{data.room.name} - 합주방</title>
</svelte:head>

<div class="max-w-4xl mx-auto space-y-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold text-white">{data.room.name}</h1>
			{#if data.room.description}
				<p class="text-sm text-[#8B8BA7] mt-1">{data.room.description}</p>
			{/if}
		</div>
		<div class="flex items-center gap-3">
			{#if !data.isParticipant}
				<button
					onclick={joinRoom}
					class="px-4 py-2 bg-[#6C5CE7] hover:bg-[#5A4BD6] text-white rounded-lg transition text-sm font-medium"
				>
					참여하기
				</button>
			{:else}
				<button
					onclick={leaveRoom}
					class="px-4 py-2 border border-[#FF6B6B]/20 text-[#FF6B6B] hover:bg-[#FF6B6B]/10 rounded-lg transition text-sm"
				>
					나가기
				</button>
			{/if}
		</div>
	</div>

	{#if data.isParticipant}
		<!-- Room Info -->
		<div class="bg-[#1A1A2E] rounded-xl border border-[#2A2A3E] p-6">
			<div class="grid grid-cols-2 gap-4 mb-6">
				<div class="bg-[#0A0A0F] rounded-lg p-4 text-center">
					<p class="text-xs text-[#8B8BA7] mb-1">참여자</p>
					<p class="text-2xl font-bold text-white">{data.room.participants.length}/{data.room.maxParticipants}</p>
				</div>
				<div class="bg-[#0A0A0F] rounded-lg p-4 text-center">
					<p class="text-xs text-[#8B8BA7] mb-1">초대 코드</p>
					<p class="text-2xl font-bold text-[#6C5CE7] font-mono">{data.room.inviteCode}</p>
				</div>
			</div>

			<!-- Participants -->
			<div class="mb-6">
				<h3 class="text-sm font-semibold text-white mb-3">참여자</h3>
				<div class="flex flex-wrap gap-3">
					{#each data.room.participants as participant}
						<div class="flex items-center gap-2 px-3 py-2 bg-[#0A0A0F] rounded-lg">
							<div class="w-8 h-8 rounded-full bg-[#6C5CE7]/20 flex items-center justify-center text-[#6C5CE7] text-xs font-bold">
								{participant.user?.displayName?.charAt(0) || 'U'}
							</div>
							<span class="text-sm text-white">{participant.user?.displayName || '사용자'}</span>
							{#if participant.userId === data.room.hostId}
								<span class="text-xs text-[#FDCB6E]">(호스트)</span>
							{/if}
						</div>
					{/each}
				</div>
			</div>

			<!-- Synchronized Metronome -->
			<div>
				<h3 class="text-sm font-semibold text-white mb-3">동기화된 메트로놈</h3>
				<Metronome bind:bpm bind:isPlaying />
			</div>

			<!-- WebRTC Audio Stream -->
			<div class="mt-6">
				<h3 class="text-sm font-semibold text-white mb-3">실시간 오디오 스트리밍</h3>
				<div class="p-4 bg-[#0A0A0F] rounded-lg border border-[#2A2A3E]">
					<p class="text-sm text-[#8B8BA7] text-center mb-4">
						실시간 오디오 스트리밍 기능은 준비 중입니다.
						<br />
						현재는 메트로놈 동기화만 지원됩니다.
					</p>
					<div class="flex items-center justify-center gap-4">
						<button
							disabled
							aria-label="마이크 켜기 (준비 중)"
							class="px-4 py-2 bg-[#2A2A3E] text-[#4A4A5E] rounded-lg text-sm cursor-not-allowed"
						>
							마이크 켜기
						</button>
						<span class="text-xs text-[#4A4A5E]">준비 중</span>
					</div>
				</div>
			</div>
		</div>
	{:else}
		<div class="bg-[#1A1A2E] rounded-xl border border-[#2A2A3E] p-8 text-center">
			<p class="text-[#8B8BA7] mb-4">이 방에 참여하려면 "참여하기" 버튼을 클릭하세요</p>
			<p class="text-xs text-[#4A4A5E]">참여자: {data.room.participants.length}/{data.room.maxParticipants}</p>
		</div>
	{/if}
</div>
