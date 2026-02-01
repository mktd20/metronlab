<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	let rooms = $state<any[]>([]);
	let loading = $state(false);
	let showCreateModal = $state(false);
	let roomName = $state('');
	let roomDescription = $state('');
	let maxParticipants = $state(4);
	let bpm = $state(120);

	onMount(async () => {
		await loadRooms();
	});

	async function loadRooms() {
		loading = true;
		try {
			const response = await fetch('/api/rooms');
			const data = await response.json();
			rooms = data.rooms || [];
		} catch (err) {
			console.error('Failed to load rooms:', err);
		} finally {
			loading = false;
		}
	}

	async function createRoom() {
		if (!roomName.trim()) {
			alert('방 이름을 입력해주세요.');
			return;
		}

		const response = await fetch('/api/rooms', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				name: roomName,
				description: roomDescription || null,
				maxParticipants,
				bpm,
				timeSignature: '4/4'
			})
		});

		if (response.ok) {
			const data = await response.json();
			showCreateModal = false;
			goto(`/rooms/${data.roomId}`);
		} else {
			alert('방 생성에 실패했습니다.');
		}
	}

	function formatTimeAgo(date: Date): string {
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffMins = Math.floor(diffMs / 60000);
		const diffHours = Math.floor(diffMs / 3600000);
		const diffDays = Math.floor(diffMs / 86400000);

		if (diffMins < 1) return '방금 전';
		if (diffMins < 60) return `${diffMins}분 전`;
		if (diffHours < 24) return `${diffHours}시간 전`;
		if (diffDays < 7) return `${diffDays}일 전`;
		return date.toLocaleDateString('ko-KR');
	}
</script>

<svelte:head>
	<title>합주방 - MetronLab</title>
</svelte:head>

<div class="max-w-4xl mx-auto space-y-6">
	<div class="flex items-center justify-between">
		<h1 class="text-2xl font-bold text-white">합주방</h1>
		<button
			onclick={() => (showCreateModal = true)}
			class="px-4 py-2 bg-[#6C5CE7] hover:bg-[#5A4BD6] text-white rounded-lg transition text-sm font-medium"
		>
			+ 방 만들기
		</button>
	</div>

	{#if showCreateModal}
		<div class="fixed inset-0 z-50 flex items-center justify-center p-4">
			<div class="absolute inset-0 bg-black/60" onclick={() => (showCreateModal = false)}></div>
			<div class="relative bg-[#1A1A2E] rounded-xl border border-[#2A2A3E] p-6 w-full max-w-md">
				<h2 class="text-lg font-semibold text-white mb-4">새 합주방 만들기</h2>
				<div class="space-y-4">
					<div>
						<label for="room-name" class="block text-sm text-[#8B8BA7] mb-1">방 이름</label>
						<input
							id="room-name"
							type="text"
							bind:value={roomName}
							class="w-full px-3 py-2 bg-[#0A0A0F] border border-[#2A2A3E] rounded-lg text-white text-sm"
							placeholder="예: 기타 연습방"
						/>
					</div>
					<div>
						<label for="room-desc" class="block text-sm text-[#8B8BA7] mb-1">설명 (선택)</label>
						<input
							id="room-desc"
							type="text"
							bind:value={roomDescription}
							class="w-full px-3 py-2 bg-[#0A0A0F] border border-[#2A2A3E] rounded-lg text-white text-sm"
						/>
					</div>
					<div class="grid grid-cols-2 gap-4">
						<div>
							<label for="max-participants" class="block text-sm text-[#8B8BA7] mb-1">최대 인원</label>
							<input
								id="max-participants"
								type="number"
								min="2"
								max="4"
								bind:value={maxParticipants}
								class="w-full px-3 py-2 bg-[#0A0A0F] border border-[#2A2A3E] rounded-lg text-white text-sm"
							/>
						</div>
						<div>
							<label for="room-bpm" class="block text-sm text-[#8B8BA7] mb-1">BPM</label>
							<input
								id="room-bpm"
								type="number"
								min="30"
								max="300"
								bind:value={bpm}
								class="w-full px-3 py-2 bg-[#0A0A0F] border border-[#2A2A3E] rounded-lg text-white text-sm"
							/>
						</div>
					</div>
					<div class="flex gap-2">
						<button
							onclick={createRoom}
							class="flex-1 px-4 py-2 bg-[#6C5CE7] hover:bg-[#5A4BD6] text-white rounded-lg transition text-sm"
						>
							만들기
						</button>
						<button
							onclick={() => (showCreateModal = false)}
							class="flex-1 px-4 py-2 border border-[#2A2A3E] text-[#8B8BA7] rounded-lg transition text-sm"
						>
							취소
						</button>
					</div>
				</div>
			</div>
		</div>
	{/if}

	{#if loading}
		<div class="text-center text-[#8B8BA7] py-8">로딩 중...</div>
	{:else if rooms.length === 0}
		<div class="bg-[#1A1A2E] rounded-xl border border-[#2A2A3E] p-8 text-center">
			<p class="text-[#8B8BA7] mb-4">현재 활성화된 합주방이 없습니다</p>
			<button
				onclick={() => (showCreateModal = true)}
				class="px-6 py-2 bg-[#6C5CE7] hover:bg-[#5A4BD6] text-white rounded-lg transition text-sm"
			>
				첫 방 만들기
			</button>
		</div>
	{:else}
		<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			{#each rooms as room}
				<a
					href="/rooms/{room.room.id}"
					class="block bg-[#1A1A2E] rounded-xl border border-[#2A2A3E] p-6 hover:border-[#6C5CE7]/50 transition"
				>
					<div class="flex items-center justify-between mb-3">
						<h3 class="text-lg font-semibold text-white">{room.room.name}</h3>
						<span class="text-xs text-[#4A4A5E]">{room.participantCount}/{room.room.maxParticipants}</span>
					</div>
					{#if room.room.description}
						<p class="text-sm text-[#8B8BA7] mb-3">{room.room.description}</p>
					{/if}
					<div class="flex items-center gap-4 text-xs text-[#4A4A5E]">
						<span>호스트: {room.host?.displayName || 'Unknown'}</span>
						<span>{room.room.currentBpm} BPM</span>
						<span>{formatTimeAgo(new Date(room.room.createdAt))}</span>
					</div>
				</a>
			{/each}
		</div>
	{/if}
</div>
