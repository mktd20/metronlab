import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { generateId } from '$lib/server/auth-utils';

export const GET: RequestHandler = async ({ url, locals }) => {
	if (!locals.user) {
		error(401, 'Unauthorized');
	}

	const sessionId = url.searchParams.get('sessionId');

	const query = db
		.select()
		.from(table.recording)
		.where(eq(table.recording.userId, locals.user.id));

	if (sessionId) {
		query.where(eq(table.recording.sessionId, sessionId));
	}

	const recordings = await query;

	return json({ success: true, recordings });
};

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		error(401, 'Unauthorized');
	}

	const formData = await request.formData();
	const sessionId = formData.get('sessionId') as string | null;
	const file = formData.get('file') as File;
	const durationSeconds = Number(formData.get('durationSeconds'));

	if (!file) {
		error(400, 'File is required');
	}

	// In production, upload to cloud storage (S3, Cloudflare R2, etc.)
	// For now, save file path or base64
	const fileUrl = `/recordings/${generateId()}.webm`; // Placeholder

	const recordingId = generateId();

	await db.insert(table.recording).values({
		id: recordingId,
		userId: locals.user.id,
		sessionId: sessionId || null,
		fileUrl,
		durationSeconds,
		fileSize: file.size
	});

	return json({ success: true, recordingId });
};
