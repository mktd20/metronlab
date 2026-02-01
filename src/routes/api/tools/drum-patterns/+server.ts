import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// Basic drum patterns
const DRUM_PATTERNS: Record<string, any> = {
	'8-beat': {
		name: '8-Beat',
		description: '기본 8비트 패턴',
		beats: 8,
		pattern: {
			HH: ['x', '-', 'x', '-', 'x', '-', 'x', '-'],
			SD: ['-', '-', 'x', '-', '-', '-', 'x', '-'],
			BD: ['x', '-', '-', '-', 'x', '-', '-', '-']
		}
	},
	'16-beat': {
		name: '16-Beat',
		description: '기본 16비트 패턴',
		beats: 16,
		pattern: {
			HH: ['x', '-', 'x', '-', 'x', '-', 'x', '-', 'x', '-', 'x', '-', 'x', '-', 'x', '-'],
			SD: ['-', '-', '-', '-', 'x', '-', '-', '-', '-', '-', '-', '-', 'x', '-', '-', '-'],
			BD: ['x', '-', '-', '-', '-', '-', 'x', '-', '-', '-', 'x', '-', '-', '-', '-', '-']
		}
	},
	shuffle: {
		name: 'Shuffle',
		description: '셔플 리듬',
		beats: 12,
		pattern: {
			HH: ['x', '-', '-', 'x', '-', '-', 'x', '-', '-', 'x', '-', '-'],
			SD: ['-', '-', '-', '-', '-', '-', 'x', '-', '-', '-', '-', '-'],
			BD: ['x', '-', '-', '-', '-', '-', '-', '-', '-', 'x', '-', '-']
		}
	},
	rock: {
		name: 'Rock',
		description: '록 스타일 패턴',
		beats: 8,
		pattern: {
			HH: ['x', '-', 'x', '-', 'x', '-', 'x', '-'],
			SD: ['-', '-', 'x', '-', '-', '-', 'x', '-'],
			BD: ['x', '-', '-', '-', 'x', '-', '-', '-']
		}
	},
	jazz: {
		name: 'Jazz Swing',
		description: '재즈 스윙 패턴',
		beats: 12,
		pattern: {
			HH: ['x', '-', '-', 'x', '-', '-', 'x', '-', '-', 'x', '-', '-'],
			SD: ['-', '-', '-', '-', '-', '-', 'x', '-', '-', '-', '-', '-'],
			BD: ['x', '-', '-', '-', '-', '-', '-', '-', '-', 'x', '-', '-']
		}
	}
};

export const GET: RequestHandler = async ({ url }) => {
	const patternId = url.searchParams.get('id');
	const category = url.searchParams.get('category');

	if (patternId) {
		const pattern = DRUM_PATTERNS[patternId];
		if (!pattern) {
			return json({ success: false, error: 'Pattern not found' }, { status: 404 });
		}
		return json({ success: true, pattern });
	}

	// Return all patterns
	const patterns = Object.entries(DRUM_PATTERNS).map(([id, pattern]) => ({
		id,
		...pattern
	}));

	return json({ success: true, patterns });
};
