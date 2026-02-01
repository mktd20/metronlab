import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// Chord dictionary data
const CHORD_DIAGRAMS: Record<string, Record<string, any>> = {
	guitar: {
		C: {
			frets: [0, 1, 0, 2, 1, 0],
			fingers: [0, 1, 0, 3, 2, 0],
			strings: ['E', 'A', 'D', 'G', 'B', 'e']
		},
		D: {
			frets: [2, 2, 2, 0, 0, 0],
			fingers: [1, 2, 3, 0, 0, 0],
			strings: ['E', 'A', 'D', 'G', 'B', 'e']
		},
		E: {
			frets: [0, 0, 1, 2, 2, 0],
			fingers: [0, 0, 1, 2, 3, 0],
			strings: ['E', 'A', 'D', 'G', 'B', 'e']
		},
		F: {
			frets: [1, 3, 3, 2, 1, 1],
			fingers: [1, 3, 4, 2, 1, 1],
			strings: ['E', 'A', 'D', 'G', 'B', 'e']
		},
		G: {
			frets: [3, 2, 0, 0, 3, 3],
			fingers: [2, 1, 0, 0, 3, 4],
			strings: ['E', 'A', 'D', 'G', 'B', 'e']
		},
		A: {
			frets: [0, 0, 2, 2, 2, 0],
			fingers: [0, 0, 1, 2, 3, 0],
			strings: ['E', 'A', 'D', 'G', 'B', 'e']
		},
		Am: {
			frets: [0, 0, 2, 2, 1, 0],
			fingers: [0, 0, 2, 3, 1, 0],
			strings: ['E', 'A', 'D', 'G', 'B', 'e']
		},
		Em: {
			frets: [0, 0, 0, 2, 2, 0],
			fingers: [0, 0, 0, 1, 2, 0],
			strings: ['E', 'A', 'D', 'G', 'B', 'e']
		}
	},
	piano: {
		C: {
			notes: ['C', 'E', 'G'],
			positions: { left: ['C3', 'E3', 'G3'], right: ['C4', 'E4', 'G4'] }
		},
		D: {
			notes: ['D', 'F#', 'A'],
			positions: { left: ['D3', 'F#3', 'A3'], right: ['D4', 'F#4', 'A4'] }
		},
		E: {
			notes: ['E', 'G#', 'B'],
			positions: { left: ['E3', 'G#3', 'B3'], right: ['E4', 'G#4', 'B4'] }
		},
		F: {
			notes: ['F', 'A', 'C'],
			positions: { left: ['F3', 'A3', 'C4'], right: ['F4', 'A4', 'C5'] }
		},
		G: {
			notes: ['G', 'B', 'D'],
			positions: { left: ['G3', 'B3', 'D4'], right: ['G4', 'B4', 'D5'] }
		},
		A: {
			notes: ['A', 'C#', 'E'],
			positions: { left: ['A3', 'C#4', 'E4'], right: ['A4', 'C#5', 'E5'] }
		}
	}
};

export const GET: RequestHandler = async ({ url }) => {
	const root = url.searchParams.get('root') || 'C';
	const type = url.searchParams.get('type') || 'major';
	const instrument = url.searchParams.get('instrument') || 'guitar';

	const chordName = type === 'major' ? root : `${root}m`;

	if (instrument === 'guitar' || instrument === 'bass') {
		const diagram = CHORD_DIAGRAMS.guitar[chordName];
		if (!diagram) {
			error(404, 'Chord not found');
		}
		return json({ success: true, chord: { name: chordName, diagram, instrument } });
	} else if (instrument === 'piano' || instrument === 'keyboard') {
		const diagram = CHORD_DIAGRAMS.piano[chordName];
		if (!diagram) {
			error(404, 'Chord not found');
		}
		return json({ success: true, chord: { name: chordName, diagram, instrument } });
	}

	error(400, 'Unsupported instrument');
};
