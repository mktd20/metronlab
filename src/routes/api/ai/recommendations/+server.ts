import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';

export const GET: RequestHandler = async ({ url, locals }) => {
	if (!locals.user) {
		error(401, 'Unauthorized');
	}

	const instrument = url.searchParams.get('instrument');

	// Get user's recent sessions
	const query = db
		.select()
		.from(table.practiceSession)
		.where(eq(table.practiceSession.userId, locals.user.id))
		.orderBy(desc(table.practiceSession.startedAt))
		.limit(20);

	const sessions = await query;

	// Get saved AI-generated sheets
	const savedSheets = await db
		.select()
		.from(table.aiGeneratedSheet)
		.where(
			and(
				eq(table.aiGeneratedSheet.userId, locals.user.id),
				eq(table.aiGeneratedSheet.isSaved, true)
			)
		)
		.orderBy(desc(table.aiGeneratedSheet.createdAt))
		.limit(10);

	// Simple recommendation logic (can be enhanced with AI)
	const recommendations = {
		underpracticedInstruments: [] as string[],
		difficultyAdjustment: null as { direction: 'up' | 'down'; reason: string } | null,
		focusAreas: [] as string[],
		suggestedSheets: savedSheets.slice(0, 3).map((s) => ({
			id: s.id,
			title: s.title,
			difficulty: s.difficulty,
			focusAreas: s.focusAreas
		}))
	};

	// Analyze practice patterns
	if (sessions.length > 0) {
		const recentAvgBpm =
			sessions.slice(0, 5).reduce((sum, s) => sum + s.initialBpm, 0) / Math.min(5, sessions.length);
		const olderAvgBpm =
			sessions.length > 5
				? sessions.slice(5, 10).reduce((sum, s) => sum + s.initialBpm, 0) / 5
				: recentAvgBpm;

		if (recentAvgBpm > olderAvgBpm * 1.1) {
			recommendations.difficultyAdjustment = {
				direction: 'up',
				reason: '최근 BPM이 크게 향상되었습니다. 더 어려운 연습을 시도해보세요.'
			};
		}
	}

	// Extract focus areas from comments
	const allComments = sessions
		.filter((s) => s.userComment)
		.map((s) => s.userComment as string)
		.join(' ');

	if (allComments.includes('리듬') || allComments.includes('박자')) {
		recommendations.focusAreas.push('rhythm');
	}
	if (allComments.includes('손가락') || allComments.includes('운지')) {
		recommendations.focusAreas.push('finger_independence');
	}

	return json({ success: true, recommendations });
};
