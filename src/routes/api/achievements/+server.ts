import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import * as achievements from '$lib/server/achievements';

export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.user) {
		error(401, 'Unauthorized');
	}

	// Check and update achievements
	const result = await achievements.checkAchievements(locals.user.id);

	// Get user's achievements
	const userAchievements = await db
		.select({
			achievement: table.achievement,
			userAchievement: table.userAchievement
		})
		.from(table.userAchievement)
		.innerJoin(table.achievement, eq(table.userAchievement.achievementId, table.achievement.id))
		.where(eq(table.userAchievement.userId, locals.user.id));

	// Get all achievements with progress
	const allAchievements = await db.select().from(table.achievement);
	const achievementMap = new Map(
		userAchievements.map((ua) => [ua.achievement.id, ua.userAchievement])
	);

	const achievementsWithProgress = allAchievements.map((ach) => {
		const userAch = achievementMap.get(ach.id);
		return {
			...ach,
			unlocked: !!userAch?.unlockedAt,
			unlockedAt: userAch?.unlockedAt,
			progress: userAch?.progress || 0
		};
	});

	return json({
		success: true,
		achievements: achievementsWithProgress,
		recentlyUnlocked: result.unlocked
	});
};
