<script lang="ts">
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	async function toggleReaction(postId: string, type: string) {
		const response = await fetch(`/api/social/feed/${postId}/reaction`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ type })
		});

		if (response.ok) {
			window.location.reload();
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

	function formatDuration(seconds: number): string {
		const m = Math.floor(seconds / 60);
		const s = seconds % 60;
		return `${m}분 ${s}초`;
	}
</script>

<svelte:head>
	<title>피드 - MetronLab</title>
</svelte:head>

<div class="max-w-3xl mx-auto space-y-6">
	<h1 class="text-2xl font-bold text-white">연습 피드</h1>

	{#if data.posts.length === 0}
		<div class="bg-[#1A1A2E] rounded-xl border border-[#2A2A3E] p-8 text-center">
			<p class="text-[#8B8BA7] mb-4">아직 피드에 게시물이 없습니다</p>
			<p class="text-sm text-[#4A4A5E]">다른 사용자를 팔로우하고 연습 기록을 공유해보세요!</p>
		</div>
	{:else}
		<div class="space-y-4">
			{#each data.posts as post}
				<div class="bg-[#1A1A2E] rounded-xl border border-[#2A2A3E] p-6">
					<!-- User Info -->
					<div class="flex items-center gap-3 mb-4">
						<div class="w-10 h-10 rounded-full bg-[#6C5CE7]/20 flex items-center justify-center text-[#6C5CE7] font-bold">
							{post.user.displayName?.charAt(0) || 'U'}
						</div>
						<div class="flex-1">
							<p class="text-sm font-medium text-white">{post.user.displayName || '사용자'}</p>
							<p class="text-xs text-[#8B8BA7]">{formatTimeAgo(post.createdAt)}</p>
						</div>
					</div>

					<!-- Session Info -->
					{#if post.session}
						<div class="mb-4 p-4 bg-[#0A0A0F] rounded-lg">
							<div class="flex items-center justify-between mb-2">
								<div>
									<p class="text-sm font-medium text-white">
										{post.session.contentTitle || post.session.contentType}
									</p>
									<p class="text-xs text-[#8B8BA7]">
										{post.session.instrumentName || post.session.instrumentType} &middot; {post.session.initialBpm} BPM
									</p>
								</div>
								<a
									href="/history/{post.session.id}"
									class="text-xs text-[#6C5CE7] hover:underline"
								>
									자세히 보기
								</a>
							</div>
							<p class="text-xs text-[#4A4A5E]">연습 시간: {formatDuration(post.session.durationSeconds)}</p>
						</div>
					{/if}

					<!-- Content -->
					{#if post.content}
						<p class="text-sm text-white mb-4">{post.content}</p>
					{/if}

					<!-- Reactions -->
					<div class="flex items-center gap-4 pt-4 border-t border-[#2A2A3E]" role="group" aria-label="게시물 리액션">
						<button
							onclick={() => toggleReaction(post.id, 'like')}
							onkeydown={(e) => e.key === 'Enter' && toggleReaction(post.id, 'like')}
							aria-label="{post.userReaction === 'like' ? '좋아요 취소' : '좋아요'}"
							aria-pressed={post.userReaction === 'like'}
							class="flex items-center gap-2 text-sm transition focus:outline-none focus:ring-2 focus:ring-[#6C5CE7] focus:ring-offset-2 focus:ring-offset-[#1A1A2E] rounded {post.userReaction === 'like'
								? 'text-[#6C5CE7]'
								: 'text-[#8B8BA7] hover:text-white'}"
						>
							<svg class="w-5 h-5" fill={post.userReaction === 'like' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
							</svg>
							좋아요
						</button>
						<button
							onclick={() => toggleReaction(post.id, 'cheer')}
							onkeydown={(e) => e.key === 'Enter' && toggleReaction(post.id, 'cheer')}
							aria-label="{post.userReaction === 'cheer' ? '응원 취소' : '응원'}"
							aria-pressed={post.userReaction === 'cheer'}
							class="flex items-center gap-2 text-sm transition focus:outline-none focus:ring-2 focus:ring-[#00B894] focus:ring-offset-2 focus:ring-offset-[#1A1A2E] rounded {post.userReaction === 'cheer'
								? 'text-[#00B894]'
								: 'text-[#8B8BA7] hover:text-white'}"
						>
							<svg class="w-5 h-5" fill={post.userReaction === 'cheer' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
							</svg>
							응원
						</button>
						<button
							onclick={() => toggleReaction(post.id, 'fire')}
							onkeydown={(e) => e.key === 'Enter' && toggleReaction(post.id, 'fire')}
							aria-label="{post.userReaction === 'fire' ? '불타오른다 취소' : '불타오른다'}"
							aria-pressed={post.userReaction === 'fire'}
							class="flex items-center gap-2 text-sm transition focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] focus:ring-offset-2 focus:ring-offset-[#1A1A2E] rounded {post.userReaction === 'fire'
								? 'text-[#FF6B6B]'
								: 'text-[#8B8BA7] hover:text-white'}"
						>
							<svg class="w-5 h-5" fill={post.userReaction === 'fire' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
							</svg>
							불타오른다
						</button>
						{#if post.reactionCount > 0}
							<span class="text-xs text-[#4A4A5E] ml-auto" aria-label="총 {post.reactionCount}개의 리액션">{post.reactionCount}개</span>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
