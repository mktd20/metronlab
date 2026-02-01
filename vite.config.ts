import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	build: {
		target: 'esnext',
		cssMinify: true,
		rollupOptions: {
			output: {
				manualChunks: {
					'vendor-charts': ['chart.js'],
					'vendor-ai': ['openai']
				}
			}
		}
	},
	optimizeDeps: {
		include: ['chart.js', 'openai']
	},
	server: {
		fs: {
			allow: ['..']
		}
	}
});
