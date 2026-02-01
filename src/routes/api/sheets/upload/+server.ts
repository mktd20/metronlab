import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { generateId } from '$lib/server/auth-utils';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		error(401, 'Unauthorized');
	}

	const formData = await request.formData();
	const title = formData.get('title') as string;
	const artist = formData.get('artist') as string | null;
	const instrumentType = formData.get('instrumentType') as string;
	const difficulty = (formData.get('difficulty') as string) || 'intermediate';
	const genre = formData.get('genre') as string | null;
	const noteDataStr = formData.get('noteData') as string;
	const tabDataStr = formData.get('tabData') as string;
	const midiData = formData.get('midiData') as string | null;
	const isPublic = formData.get('isPublic') === 'true';

	if (!title || !instrumentType) {
		error(400, 'Title and instrument type are required');
	}

	let noteData, tabData;
	try {
		noteData = noteDataStr ? JSON.parse(noteDataStr) : null;
		tabData = tabDataStr ? JSON.parse(tabDataStr) : null;
	} catch (e) {
		error(400, 'Invalid JSON data');
	}

	const sheetId = generateId();

	await db.insert(table.sheetMusic).values({
		id: sheetId,
		title,
		artist,
		instrumentType,
		difficulty,
		genre,
		noteData,
		tabData,
		midiData,
		source: 'user_upload',
		uploadedBy: locals.user.id,
		isPublic
	});

	return json({ success: true, sheetId });
};
