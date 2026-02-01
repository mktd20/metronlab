import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq, gte, desc, and } from 'drizzle-orm';
import * as aiService from '$lib/server/ai';
import { generateId } from '$lib/server/auth-utils';

export const GET: RequestHandler = async ({ url, locals }) => {
	if (!locals.user) {
		error(401, 'Unauthorized');
	}

	const type = (url.searchParams.get('type') || 'weekly') as 'weekly' | 'monthly';

	// Calculate date range
	const now = new Date();
	const startDate = new Date();
	if (type === 'weekly') {
		startDate.setDate(now.getDate() - 7);
	} else {
		startDate.setMonth(now.getMonth() - 1);
	}

	// Get sessions in period
	const sessions = await db
		.select()
		.from(table.practiceSession)
		.where(
			and(
				eq(table.practiceSession.userId, locals.user.id),
				gte(table.practiceSession.startedAt, startDate)
			)
		)
		.orderBy(desc(table.practiceSession.startedAt));

	// Calculate summary
	const totalMinutes = sessions.reduce((sum, s) => sum + s.durationSeconds, 0) / 60;
	const avgBpm =
		sessions.length > 0
			? sessions.reduce((sum, s) => sum + s.initialBpm, 0) / sessions.length
			: 0;
	const completionRate =
		sessions.length > 0
			? sessions.reduce((sum, s) => sum + (s.completionRate || 0), 0) / sessions.length
			: 0;

	const summary = {
		totalMinutes: Math.round(totalMinutes),
		totalSessions: sessions.length,
		avgBpm: Math.round(avgBpm),
		avgCompletionRate: Math.round(completionRate * 100) / 100
	};

	try {
		const report = await aiService.generatePeriodicReport(
			locals.user.id,
			type,
			sessions,
			summary
		);

		// Save report
		const reportId = generateId();
		await db.insert(table.aiAnalysis).values({
			id: reportId,
			userId: locals.user.id,
			type: type,
			analysisData: report,
			summary: report.summary,
			recommendations: report.recommendations
		});

		return json({ success: true, report, summary });
	} catch (err) {
		console.error('Report generation error:', err);
		error(500, 'Failed to generate report');
	}
};
