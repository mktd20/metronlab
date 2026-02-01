<script lang="ts">
	import Modal from '$lib/components/Modal.svelte';

	interface Props {
		open: boolean;
		onClose: () => void;
		onSave: (data: { comment: string; quickTags: string[]; satisfactionRating: number | null }) => void;
		durationSeconds: number;
		bpm: number;
	}

	let { open, onClose, onSave, durationSeconds, bpm }: Props = $props();

	let comment = $state('');
	let selectedTags = $state<string[]>([]);
	let rating = $state<number | null>(null);

	const quickTags = ['어려웠음', '잘됨', '손가락아픔', '리듬불안정', 'BPM올려야함', '재미있었음'];

	function toggleTag(tag: string) {
		if (selectedTags.includes(tag)) {
			selectedTags = selectedTags.filter((t) => t !== tag);
		} else {
			selectedTags = [...selectedTags, tag];
		}
	}

	function formatDuration(s: number): string {
		const h = Math.floor(s / 3600);
		const m = Math.floor((s % 3600) / 60);
		const sec = s % 60;
		if (h > 0) return `${h}시간 ${m}분 ${sec}초`;
		if (m > 0) return `${m}분 ${sec}초`;
		return `${sec}초`;
	}

	function handleSave() {
		onSave({ comment, quickTags: selectedTags, satisfactionRating: rating });
		comment = '';
		selectedTags = [];
		rating = null;
	}

	function handleSkip() {
		onSave({ comment: '', quickTags: [], satisfactionRating: null });
		comment = '';
		selectedTags = [];
		rating = null;
	}
</script>

<Modal {open} {onClose} title="연습 완료!">
	<!-- Summary -->
	<div class="flex gap-4 mb-6">
		<div class="flex-1 bg-[#0A0A0F] rounded-lg p-3 text-center">
			<p class="text-xs text-[#8B8BA7]">연습 시간</p>
			<p class="text-lg font-bold text-white">{formatDuration(durationSeconds)}</p>
		</div>
		<div class="flex-1 bg-[#0A0A0F] rounded-lg p-3 text-center">
			<p class="text-xs text-[#8B8BA7]">BPM</p>
			<p class="text-lg font-bold text-white">{bpm}</p>
		</div>
	</div>

	<!-- Comment -->
	<div class="mb-4">
		<label for="comment" class="block text-sm text-[#8B8BA7] mb-1.5">오늘 연습 어땠나요?</label>
		<textarea
			id="comment"
			bind:value={comment}
			placeholder="어려웠던 부분, 느낀 점을 자유롭게 적어주세요"
			rows={3}
			class="w-full px-4 py-3 bg-[#0A0A0F] border border-[#2A2A3E] rounded-lg text-white placeholder-[#4A4A5E] focus:outline-none focus:border-[#6C5CE7] text-sm resize-none"
		></textarea>
	</div>

	<!-- Quick Tags -->
	<div class="mb-4">
		<p class="text-sm text-[#8B8BA7] mb-2">빠른 태그</p>
		<div class="flex flex-wrap gap-2">
			{#each quickTags as tag}
				<button
					onclick={() => toggleTag(tag)}
					class="px-3 py-1.5 rounded-full text-xs border transition {selectedTags.includes(tag)
						? 'border-[#6C5CE7] bg-[#6C5CE7]/10 text-[#6C5CE7]'
						: 'border-[#2A2A3E] text-[#8B8BA7] hover:border-[#6C5CE7]/30'}"
				>
					#{tag}
				</button>
			{/each}
		</div>
	</div>

	<!-- Rating -->
	<div class="mb-6">
		<p class="text-sm text-[#8B8BA7] mb-2">만족도</p>
		<div class="flex gap-2">
			{#each [1, 2, 3, 4, 5] as star}
				<button
					onclick={() => (rating = rating === star ? null : star)}
					class="text-2xl transition {rating !== null && star <= rating ? 'text-[#FDCB6E]' : 'text-[#2A2A3E] hover:text-[#FDCB6E]/50'}"
				>
					★
				</button>
			{/each}
		</div>
	</div>

	<!-- Actions -->
	<div class="flex gap-3">
		<button
			onclick={handleSkip}
			class="flex-1 py-2.5 border border-[#2A2A3E] text-[#8B8BA7] hover:text-white rounded-lg transition text-sm"
		>
			건너뛰기
		</button>
		<button
			onclick={handleSave}
			class="flex-1 py-2.5 bg-[#6C5CE7] hover:bg-[#5A4BD6] text-white rounded-lg transition text-sm font-medium"
		>
			저장
		</button>
	</div>
</Modal>
