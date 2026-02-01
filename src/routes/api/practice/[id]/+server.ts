import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';

export const DELETE: RequestHandler = async ({ params, locals }) => {
	if (!locals.user) {
		error(401, 'Unauthorized');
	}

	const sessionId = params.id;

	// Verify ownership
	const [session] = await db
		.select()
		.from(table.practiceSession)
		.where(
			and(
				eq(table.practiceSession.id, sessionId),
				eq(table.practiceSession.userId, locals.user.id)
			)
		)
		.limit(1);

	if (!session) {
		error(404, 'Session not found');
	}

	// Delete related AI analyses
	await db
		.delete(table.aiAnalysis)
		.where(eq(table.aiAnalysis.sessionId, sessionId));

	// Delete practice tags
	await db
		.delete(table.practiceTag)
		.where(eq(table.practiceTag.sessionId, sessionId));

	// Delete the session
	await db
		.delete(table.practiceSession)
		.where(
			and(
				eq(table.practiceSession.id, sessionId),
				eq(table.practiceSession.userId, locals.user.id)
			)
		);

	return json({ success: true });
};
