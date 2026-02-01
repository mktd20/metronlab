import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq, and, gte, lte } from 'drizzle-orm';

export interface GoalProgress {
	goalId: string;
	current: number;
	target: number;
	percentage: number;
	isAchieved: boolean;
}

export async function calculateGoalProgress(
	userId: string,
	goal: typeof table.practiceGoal.$inferSelect
): Promise<GoalProgress> {
	const now = new Date();
	let startDate: Date;
	let endDate: Date = now;

	switch (goal.type) {
		case 'daily':
			startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
			break;
		case 'weekly':
			startDate = new Date(now);
			startDate.setDate(now.getDate() - now.getDay());
			startDate.setHours(0, 0, 0, 0);
			break;
		case 'monthly':
			startDate = new Date(now.getFullYear(), now.getMonth(), 1);
			break;
		default:
			startDate = new Date(0);
	}

	const conditions = [
		eq(table.practiceSession.userId, userId),
		gte(table.practiceSession.startedAt, startDate),
		lte(table.practiceSession.startedAt, endDate)
	];

	if (goal.instrumentId) {
		conditions.push(eq(table.practiceSession.instrumentId, goal.instrumentId));
	}

	const sessions = await db
		.select()
		.from(table.practiceSession)
		.where(and(...conditions));

	let current = 0;

	switch (goal.targetType) {
		case 'time':
			// Total minutes
			current = Math.round(sessions.reduce((sum, s) => sum + s.durationSeconds, 0) / 60);
			break;
		case 'sessions':
			// Number of sessions
			current = sessions.length;
			break;
		case 'bpm':
			// Max BPM achieved
			current = Math.max(...sessions.map((s) => s.finalBpm), 0);
			break;
	}

	const percentage = goal.targetValue > 0 ? Math.min(100, (current / goal.targetValue) * 100) : 0;
	const isAchieved = current >= goal.targetValue;

	return {
		goalId: goal.id,
		current,
		target: goal.targetValue,
		percentage,
		isAchieved
	};
}
