import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import * as aiService from '$lib/server/ai';
import { generateId } from '$lib/server/auth-utils';

export const POST: RequestHandler = async ({ params, locals }) => {
	if (!locals.user) {
		error(401, 'Unauthorized');
	}

	const sessionId = params.id;

	// Get session with user comment
	const [session] = await db
		.select()
		.from(table.practiceSession)
		.where(
			and(
				eq(table.practiceSession.id, sessionId),
				eq(table.practiceSession.userId, locals.user.id)
			)
		);

	if (!session) {
		error(404, 'Session not found');
	}

	if (!session.endedAt) {
		error(400, 'Session must be ended before analysis');
	}

	try {
		// Analyze session
		const analysis = await aiService.analyzeSession(
			session.sessionData,
			session.userComment || undefined,
			(session.quickTags as string[]) || undefined
		);

		// Save analysis to database
		const analysisId = generateId();
		await db.insert(table.aiAnalysis).values({
			id: analysisId,
			userId: locals.user.id,
			sessionId: sessionId,
			type: 'session',
			analysisData: analysis,
			summary: analysis.summary,
			recommendations: analysis.recommendations
		});

		return json({ success: true, analysis });
	} catch (err) {
		console.error('Analysis error:', err);
		error(500, 'Failed to analyze session');
	}
};
