import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// Scale patterns
const SCALE_PATTERNS: Record<string, number[]> = {
	major: [0, 2, 4, 5, 7, 9, 11],
	minor: [0, 2, 3, 5, 7, 8, 10],
	'minor-pentatonic': [0, 3, 5, 7, 10],
	'major-pentatonic': [0, 2, 4, 7, 9],
	blues: [0, 3, 5, 6, 7, 10],
	dorian: [0, 2, 3, 5, 7, 9, 10],
	mixolydian: [0, 2, 4, 5, 7, 9, 10]
};

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

function getScaleNotes(root: string, scaleType: string): string[] {
	const rootIndex = NOTE_NAMES.indexOf(root);
	if (rootIndex === -1) {
		return [];
	}

	const pattern = SCALE_PATTERNS[scaleType] || SCALE_PATTERNS.major;
	return pattern.map((interval) => NOTE_NAMES[(rootIndex + interval) % 12]);
}

function getGuitarPositions(notes: string[], key: string): any {
	// Simplified guitar position mapping
	// In production, implement full fretboard mapping
	return {
		positions: notes.map((note, i) => ({
			note,
			frets: [i * 2, i * 2 + 2, i * 2 + 4], // Simplified
			strings: ['E', 'A', 'D']
		}))
	};
}

export const GET: RequestHandler = async ({ url }) => {
	const key = url.searchParams.get('key') || 'C';
	const type = url.searchParams.get('type') || 'major';
	const instrument = url.searchParams.get('instrument') || 'guitar';

	const notes = getScaleNotes(key, type);

	if (instrument === 'guitar' || instrument === 'bass') {
		const positions = getGuitarPositions(notes, key);
		return json({
			success: true,
			scale: {
				key,
				type,
				notes,
				positions,
				instrument
			}
		});
	}

	return json({
		success: true,
		scale: {
			key,
			type,
			notes,
			instrument
		}
	});
};
