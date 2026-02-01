<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
	let loading = $state(false);
</script>

<svelte:head>
	<title>로그인 - MetronLab</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-[#0A0A0F] px-4">
	<div class="w-full max-w-md">
		<div class="text-center mb-8">
			<a href="/" class="text-3xl font-bold text-white">
				<span class="text-[#6C5CE7]">Metron</span>Lab
			</a>
			<p class="text-[#8B8BA7] mt-2">다시 오셨군요! 로그인해주세요</p>
		</div>

		<form
			method="POST"
			use:enhance={() => {
				loading = true;
				return async ({ update }) => {
					loading = false;
					await update();
				};
			}}
			class="bg-[#1A1A2E] rounded-2xl p-8 shadow-xl"
		>
			{#if form?.error}
				<div class="bg-red-500/10 border border-red-500/20 text-[#FF6B6B] px-4 py-3 rounded-lg mb-6 text-sm">
					{form.error}
				</div>
			{/if}

			<div class="space-y-5">
				<div>
					<label for="email" class="block text-sm font-medium text-[#8B8BA7] mb-1.5">이메일</label>
					<input
						id="email"
						name="email"
						type="email"
						required
						value={form?.email ?? ''}
						placeholder="your@email.com"
						class="w-full px-4 py-3 bg-[#0A0A0F] border border-[#2A2A3E] rounded-lg text-white placeholder-[#4A4A5E] focus:outline-none focus:border-[#6C5CE7] focus:ring-1 focus:ring-[#6C5CE7] transition"
					/>
				</div>

				<div>
					<label for="password" class="block text-sm font-medium text-[#8B8BA7] mb-1.5">비밀번호</label>
					<input
						id="password"
						name="password"
						type="password"
						required
						placeholder="비밀번호 입력"
						class="w-full px-4 py-3 bg-[#0A0A0F] border border-[#2A2A3E] rounded-lg text-white placeholder-[#4A4A5E] focus:outline-none focus:border-[#6C5CE7] focus:ring-1 focus:ring-[#6C5CE7] transition"
					/>
				</div>
			</div>

			<button
				type="submit"
				disabled={loading}
				class="w-full mt-6 py-3 bg-[#6C5CE7] hover:bg-[#5A4BD6] text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
			>
				{loading ? '로그인 중...' : '로그인'}
			</button>

			<p class="text-center text-[#8B8BA7] text-sm mt-6">
				계정이 없으신가요?
				<a href="/register" class="text-[#6C5CE7] hover:underline">회원가입</a>
			</p>
		</form>
	</div>
</div>
