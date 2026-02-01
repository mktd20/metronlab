<script lang="ts">
	const features = [
		{ title: '정밀 메트로놈', desc: 'Web Audio API 기반 1ms 이내 정확도의 메트로놈', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', color: '#6C5CE7' },
		{ title: 'AI 분석', desc: '연습 데이터를 AI가 분석하여 맞춤 피드백 제공', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z', color: '#FD79A8' },
		{ title: 'Note/Tab 전환', desc: '오선보와 타브 악보를 실시간으로 전환하며 연습', icon: 'M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3', color: '#00B894' },
		{ title: '연습 기록 관리', desc: '모든 연습이 자동으로 기록되고 그래프로 확인', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', color: '#FDCB6E' }
	];

	const steps = [
		{ title: '가입하기', desc: '이메일로 간단하게 가입하고 악기를 등록하세요' },
		{ title: '연습하기', desc: '메트로놈을 켜고 악보를 보며 연습을 시작하세요' },
		{ title: '성장하기', desc: 'AI가 분석한 리포트로 실력 향상을 확인하세요' }
	];

	const instruments = [
		'Electric Guitar', 'Acoustic Guitar', 'Bass Guitar',
		'Drums', 'Keyboard', 'Piano', 'Violin', 'Ukulele', 'Vocal'
	];
</script>

<svelte:head>
	<title>MetronLab - AI가 분석하는 나만의 연습 매니저</title>
</svelte:head>

<div class="min-h-screen bg-[#0A0A0F]">
	<!-- Header -->
	<header class="flex items-center justify-between px-6 lg:px-12 py-4">
		<div class="text-2xl font-bold text-white">
			<span class="text-[#6C5CE7]">Metron</span>Lab
		</div>
		<div class="flex items-center gap-4">
			<a href="/login" class="text-sm text-[#8B8BA7] hover:text-white transition">로그인</a>
			<a href="/register" class="text-sm px-4 py-2 bg-[#6C5CE7] hover:bg-[#5A4BD6] text-white rounded-lg transition">
				시작하기
			</a>
		</div>
	</header>

	<!-- Hero -->
	<section class="px-6 lg:px-12 pt-20 pb-24 text-center max-w-4xl mx-auto">
		<div class="inline-flex items-center gap-2 px-4 py-1.5 bg-[#6C5CE7]/10 border border-[#6C5CE7]/20 rounded-full text-[#6C5CE7] text-sm mb-6">
			AI 기반 연습 분석
		</div>
		<h1 class="text-4xl lg:text-6xl font-bold text-white leading-tight mb-6">
			AI가 분석하는<br />
			<span class="text-[#6C5CE7]">나만의 연습 매니저</span>
		</h1>
		<p class="text-lg text-[#8B8BA7] max-w-2xl mx-auto mb-10">
			메트로놈으로 연습하고, 기록하고, AI가 분석해줍니다.
			모든 악기를 지원하는 체계적인 연습 관리 플랫폼.
		</p>
		<div class="flex items-center justify-center gap-4">
			<a href="/register" class="px-8 py-3 bg-[#6C5CE7] hover:bg-[#5A4BD6] text-white font-semibold rounded-xl transition text-lg">
				무료로 시작하기
			</a>
			<a href="#features" class="px-8 py-3 border border-[#2A2A3E] hover:border-[#6C5CE7] text-[#8B8BA7] hover:text-white rounded-xl transition text-lg">
				더 알아보기
			</a>
		</div>
	</section>

	<!-- Features -->
	<section id="features" class="px-6 lg:px-12 py-20 max-w-6xl mx-auto">
		<h2 class="text-2xl lg:text-3xl font-bold text-white text-center mb-12">주요 기능</h2>
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
			{#each features as feature}
				<div class="bg-[#1A1A2E] rounded-xl p-6 border border-[#2A2A3E] hover:border-[#6C5CE7]/30 transition">
					<div class="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style="background-color: {feature.color}20">
						<svg class="w-6 h-6" style="color: {feature.color}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={feature.icon} />
						</svg>
					</div>
					<h3 class="text-lg font-semibold text-white mb-2">{feature.title}</h3>
					<p class="text-sm text-[#8B8BA7]">{feature.desc}</p>
				</div>
			{/each}
		</div>
	</section>

	<!-- How It Works -->
	<section class="px-6 lg:px-12 py-20 max-w-4xl mx-auto">
		<h2 class="text-2xl lg:text-3xl font-bold text-white text-center mb-12">이렇게 사용하세요</h2>
		<div class="grid grid-cols-1 md:grid-cols-3 gap-8">
			{#each steps as step, i}
				<div class="text-center">
					<div class="w-14 h-14 rounded-full bg-[#6C5CE7] text-white text-xl font-bold flex items-center justify-center mx-auto mb-4">
						{i + 1}
					</div>
					<h3 class="text-lg font-semibold text-white mb-2">{step.title}</h3>
					<p class="text-sm text-[#8B8BA7]">{step.desc}</p>
				</div>
			{/each}
		</div>
	</section>

	<!-- Instruments -->
	<section class="px-6 lg:px-12 py-20 max-w-4xl mx-auto text-center">
		<h2 class="text-2xl lg:text-3xl font-bold text-white mb-4">모든 악기를 지원합니다</h2>
		<p class="text-[#8B8BA7] mb-10">기타, 드럼, 피아노, 바이올린 등 어떤 악기든 연습하세요</p>
		<div class="flex flex-wrap items-center justify-center gap-4">
			{#each instruments as inst}
				<div class="px-5 py-3 bg-[#1A1A2E] border border-[#2A2A3E] rounded-xl text-sm text-[#8B8BA7] hover:text-white hover:border-[#6C5CE7]/30 transition">
					{inst}
				</div>
			{/each}
		</div>
	</section>

	<!-- CTA -->
	<section class="px-6 lg:px-12 py-20 text-center">
		<div class="max-w-2xl mx-auto bg-[#1A1A2E] border border-[#2A2A3E] rounded-2xl p-10">
			<h2 class="text-2xl font-bold text-white mb-4">지금 바로 연습을 시작하세요</h2>
			<p class="text-[#8B8BA7] mb-8">무료로 가입하고 AI 연습 매니저를 만나보세요</p>
			<a href="/register" class="inline-block px-8 py-3 bg-[#6C5CE7] hover:bg-[#5A4BD6] text-white font-semibold rounded-xl transition">
				무료로 시작하기
			</a>
		</div>
	</section>

	<!-- Footer -->
	<footer class="px-6 lg:px-12 py-8 border-t border-[#2A2A3E] text-center">
		<p class="text-sm text-[#8B8BA7]">
			&copy; {new Date().getFullYear()} MetronLab. All rights reserved.
		</p>
	</footer>
</div>
