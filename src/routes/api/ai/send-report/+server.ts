import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import * as emailService from '$lib/server/email';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		error(401, 'Unauthorized');
	}

	const body = await request.json();
	const { type = 'weekly' } = body;

	// Get the most recent report
	const [report] = await db
		.select()
		.from(table.aiAnalysis)
		.where(
			and(
				eq(table.aiAnalysis.userId, locals.user.id),
				eq(table.aiAnalysis.type, type)
			)
		)
		.orderBy(desc(table.aiAnalysis.createdAt))
		.limit(1);

	if (!report) {
		error(404, 'Report not found. Please generate a report first.');
	}

	// Get user email
	const [user] = await db
		.select()
		.from(table.user)
		.where(eq(table.user.id, locals.user.id))
		.limit(1);

	if (!user || !user.email) {
		error(400, 'User email not found');
	}

	// Get summary data for email
	const sessions = await db
		.select()
		.from(table.practiceSession)
		.where(eq(table.practiceSession.userId, locals.user.id))
		.orderBy(desc(table.practiceSession.startedAt))
		.limit(100);

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

	const reportData = report.analysisData as {
		summary: string;
		strengths: string[];
		weaknesses: string[];
		improvements: string[];
		recommendations: string[];
	};

	try {
		const emailOptions = emailService.generateReportEmail(
			user.displayName,
			type as 'weekly' | 'monthly',
			reportData,
			summary
		);
		emailOptions.to = user.email;

		await emailService.sendEmail(emailOptions);

		return json({ success: true, message: 'Report email sent successfully' });
	} catch (err) {
		console.error('Email sending error:', err);
		error(500, 'Failed to send email');
	}
};
