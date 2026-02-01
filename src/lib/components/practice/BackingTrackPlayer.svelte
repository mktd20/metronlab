<script lang="ts">
	import { onMount, onDestroy } from 'svelte';

	interface Props {
		metronomeBpm: number;
		onBpmChange?: (bpm: number) => void;
	}

	let { metronomeBpm, onBpmChange }: Props = $props();

	let audioFile: File | null = $state(null);
	let audioUrl: string | null = $state(null);
	let audioElement: HTMLAudioElement | null = $state(null);
	let youtubeUrl = $state('');
	let youtubeVideoId = $state<string | null>(null);
	let youtubePlayer: any = null;
	let isPlaying = $state(false);
	let volume = $state(0.5);
	let playbackRate = $state(1.0);
	let sourceType: 'file' | 'youtube' = $state('file');

	function extractYouTubeId(url: string): string | null {
		const patterns = [
			/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
			/youtube\.com\/watch\?.*v=([^&\n?#]+)/
		];

		for (const pattern of patterns) {
			const match = url.match(pattern);
			if (match && match[1]) {
				return match[1];
			}
		}
		return null;
	}

	function handleYouTubeUrl() {
		if (!youtubeUrl.trim()) {
			youtubeVideoId = null;
			return;
		}

		const videoId = extractYouTubeId(youtubeUrl);
		if (videoId) {
			youtubeVideoId = videoId;
			sourceType = 'youtube';
			loadYouTubePlayer();
		} else {
			alert('올바른 YouTube URL을 입력해주세요.');
		}
	}

	function loadYouTubePlayer() {
		if (!youtubeVideoId || typeof window === 'undefined') return;

		// @ts-ignore - YouTube API is loaded dynamically
		const win: any = window;
		
		// Load YouTube IFrame API if not already loaded
		if (!win.YT) {
			const tag = document.createElement('script');
			tag.src = 'https://www.youtube.com/iframe_api';
			const firstScriptTag = document.getElementsByTagName('script')[0];
			firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

			win.onYouTubeIframeAPIReady = () => {
				initializeYouTubePlayer();
			};
		} else {
			initializeYouTubePlayer();
		}
	}

	function initializeYouTubePlayer() {
		if (!youtubeVideoId) return;
		
		// @ts-ignore - YouTube API is loaded dynamically
		const win: any = window;
		if (!win.YT) return;

		// Destroy existing player if any
		if (youtubePlayer) {
			try {
				youtubePlayer.destroy();
			} catch (e) {
				// Ignore errors
			}
		}

		const YT = win.YT;
		youtubePlayer = new YT.Player('youtube-player', {
			videoId: youtubeVideoId,
			playerVars: {
				controls: 1,
				modestbranding: 1,
				rel: 0,
				enablejsapi: 1
			},
			events: {
				onReady: (event: any) => {
					event.target.setVolume(volume * 100);
				},
				onStateChange: (event: any) => {
					// YT.PlayerState.PLAYING = 1, PAUSED = 2, ENDED = 0
					isPlaying = event.data === 1;
				}
			}
		});
	}

	function handleFileSelect(event: Event) {
		const input = event.target as HTMLInputElement;
		if (input.files && input.files[0]) {
			audioFile = input.files[0];
			if (audioUrl) {
				URL.revokeObjectURL(audioUrl);
			}
			audioUrl = URL.createObjectURL(audioFile);
			if (audioElement) {
				audioElement.src = audioUrl;
			}
			sourceType = 'file';
			youtubeVideoId = null;
		}
	}

	function togglePlayback() {
		if (sourceType === 'youtube' && youtubePlayer) {
			if (isPlaying) {
				youtubePlayer.pauseVideo();
			} else {
				youtubePlayer.playVideo();
			}
		} else if (audioElement) {
			if (isPlaying) {
				audioElement.pause();
			} else {
				audioElement.play();
			}
			isPlaying = !isPlaying;
		}
	}

	function syncWithMetronome() {
		if (sourceType === 'youtube' && youtubePlayer) {
			// YouTube doesn't support playback rate changes easily
			// This is a limitation - could use YouTube's playbackRate API if available
		} else if (audioElement) {
			audioElement.playbackRate = playbackRate;
		}
	}

	onMount(() => {
		audioElement = new Audio();
		audioElement.addEventListener('ended', () => {
			isPlaying = false;
		});
		return () => {
			if (audioUrl) {
				URL.revokeObjectURL(audioUrl);
			}
			audioElement?.pause();
			if (youtubePlayer) {
				youtubePlayer.destroy();
			}
		};
	});

	$effect(() => {
		if (sourceType === 'youtube' && youtubePlayer) {
			youtubePlayer.setVolume(volume * 100);
		} else if (audioElement) {
			audioElement.volume = volume;
		}
	});
</script>

<div class="bg-[#1A1A2E] rounded-xl border border-[#2A2A3E] p-6">
	<h3 class="text-lg font-semibold text-white mb-4">배킹 트랙</h3>

	<div class="space-y-4">
		<!-- Source Type Toggle -->
		<div class="flex gap-2 mb-4">
			<button
				type="button"
				onclick={() => { sourceType = 'file'; youtubeVideoId = null; }}
				class="flex-1 px-3 py-2 rounded-lg text-sm font-medium transition {sourceType === 'file'
					? 'bg-[#6C5CE7] text-white'
					: 'bg-[#0A0A0F] text-[#8B8BA7] border border-[#2A2A3E] hover:text-white'}"
			>
				파일
			</button>
			<button
				type="button"
				onclick={() => { sourceType = 'youtube'; audioFile = null; audioUrl = null; }}
				class="flex-1 px-3 py-2 rounded-lg text-sm font-medium transition {sourceType === 'youtube'
					? 'bg-[#6C5CE7] text-white'
					: 'bg-[#0A0A0F] text-[#8B8BA7] border border-[#2A2A3E] hover:text-white'}"
			>
				YouTube
			</button>
		</div>

		{#if sourceType === 'file'}
			<!-- File Upload -->
			<div>
				<label for="backing-file" class="block text-sm text-[#8B8BA7] mb-2">오디오 파일</label>
				<input
					id="backing-file"
					type="file"
					accept="audio/*"
					onchange={handleFileSelect}
					class="w-full px-3 py-2 bg-[#0A0A0F] border border-[#2A2A3E] rounded-lg text-white text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#6C5CE7] file:text-white hover:file:bg-[#5A4BD6]"
				/>
			</div>
		{:else}
			<!-- YouTube URL Input -->
			<div>
				<label for="youtube-url" class="block text-sm text-[#8B8BA7] mb-2">YouTube URL</label>
				<div class="flex gap-2">
					<input
						id="youtube-url"
						type="text"
						bind:value={youtubeUrl}
						placeholder="https://www.youtube.com/watch?v=..."
						class="flex-1 px-3 py-2 bg-[#0A0A0F] border border-[#2A2A3E] rounded-lg text-white text-sm focus:outline-none focus:border-[#6C5CE7]"
					/>
					<button
						type="button"
						onclick={handleYouTubeUrl}
						class="px-4 py-2 bg-[#6C5CE7] hover:bg-[#5A4BD6] text-white rounded-lg transition text-sm font-medium"
					>
						로드
					</button>
				</div>
			</div>
		{/if}

		{#if (sourceType === 'file' && audioUrl) || (sourceType === 'youtube' && youtubeVideoId)}
			<!-- Playback Controls -->
			<div class="space-y-3">
				{#if sourceType === 'youtube' && youtubeVideoId}
					<!-- YouTube Player -->
					<div class="aspect-video bg-[#0A0A0F] rounded-lg overflow-hidden">
						<div id="youtube-player" class="w-full h-full"></div>
					</div>
				{/if}

				<button
					onclick={togglePlayback}
					class="w-full py-2 bg-[#6C5CE7] hover:bg-[#5A4BD6] text-white rounded-lg transition font-medium"
				>
					{isPlaying ? '일시정지' : '재생'}
				</button>

				<!-- Volume Control -->
				<div>
					<label for="backing-volume" class="block text-sm text-[#8B8BA7] mb-1">볼륨</label>
					<input
						id="backing-volume"
						type="range"
						min="0"
						max="1"
						step="0.01"
						bind:value={volume}
						class="w-full accent-[#6C5CE7]"
					/>
					<div class="text-xs text-[#4A4A5E] text-right">{Math.round(volume * 100)}%</div>
				</div>

				{#if sourceType === 'file'}
					<!-- Playback Rate (only for file) -->
					<div>
						<label for="backing-rate" class="block text-sm text-[#8B8BA7] mb-1">재생 속도</label>
						<input
							id="backing-rate"
							type="range"
							min="0.5"
							max="2"
							step="0.1"
							bind:value={playbackRate}
							oninput={() => syncWithMetronome()}
							class="w-full accent-[#6C5CE7]"
						/>
						<div class="text-xs text-[#4A4A5E] text-right">{playbackRate.toFixed(1)}x</div>
					</div>
				{/if}
			</div>
		{/if}
	</div>
</div>
