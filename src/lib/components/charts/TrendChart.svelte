<script lang="ts">
	import { onMount } from 'svelte';
	import { Chart, registerables } from 'chart.js';

	interface Props {
		data: { date: string; minutes: number }[];
	}

	let { data }: Props = $props();
	let canvas: HTMLCanvasElement;
	let chart: Chart | null = null;

	onMount(() => {
		Chart.register(...registerables);

		// Aggregate by date
		const aggregated = new Map<string, number>();
		for (const d of data) {
			aggregated.set(d.date, (aggregated.get(d.date) || 0) + d.minutes);
		}

		// Fill 30 days
		const labels: string[] = [];
		const values: number[] = [];
		const today = new Date();
		for (let i = 29; i >= 0; i--) {
			const d = new Date(today);
			d.setDate(d.getDate() - i);
			const key = d.toISOString().split('T')[0];
			labels.push(`${d.getMonth() + 1}/${d.getDate()}`);
			values.push(aggregated.get(key) || 0);
		}

		chart = new Chart(canvas, {
			type: 'line',
			data: {
				labels,
				datasets: [
					{
						label: '연습 시간 (분)',
						data: values,
						borderColor: '#6C5CE7',
						backgroundColor: 'rgba(108, 92, 231, 0.1)',
						fill: true,
						tension: 0.4,
						pointBackgroundColor: '#6C5CE7',
						pointBorderColor: '#6C5CE7',
						pointRadius: 2,
						pointHoverRadius: 5
					}
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: { display: false }
				},
				scales: {
					x: {
						grid: { color: 'rgba(42, 42, 62, 0.5)' },
						ticks: { color: '#8B8BA7', maxTicksLimit: 7, font: { size: 11 } }
					},
					y: {
						grid: { color: 'rgba(42, 42, 62, 0.5)' },
						ticks: { color: '#8B8BA7', font: { size: 11 } },
						beginAtZero: true
					}
				}
			}
		});

		return () => {
			chart?.destroy();
		};
	});
</script>

<div class="h-64">
	<canvas bind:this={canvas}></canvas>
</div>
