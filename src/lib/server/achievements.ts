import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq, and, gte, desc } from 'drizzle-orm';
import { generateId } from './auth-utils';

export interface AchievementCheckResult {
	unlocked: string[]; // achievement IDs
	updated: Array<{ achievementId: string; progress: number }>;
}

export async function checkAchievements(userId: string): Promise<AchievementCheckResult> {
	const unlocked: string[] = [];
	const updated: Array<{ achievementId: string; progress: number }> = [];

	// Get all achievements
	const allAchievements = await db.select().from(table.achievement);

	// Get user's existing achievements
	const userAchievements = await db
		.select()
		.from(table.userAchievement)
		.where(eq(table.userAchievement.userId, userId));

	const userAchievementMap = new Map(
		userAchievements.map((ua) => [ua.achievementId, ua])
	);

	// Get user's practice data
	const sessions = await db
		.select()
		.from(table.practiceSession)
		.where(eq(table.practiceSession.userId, userId));

	const totalHours = sessions.reduce((sum, s) => sum + s.durationSeconds, 0) / 3600;
	const totalMinutes = totalHours * 60;

	// Calculate streak
	const streak = calculateStreak(sessions);

	// Get unique instruments practiced
	const instruments = await db
		.select()
		.from(table.instrument)
		.where(eq(table.instrument.userId, userId));

	const uniqueInstruments = new Set(sessions.map((s) => s.instrumentId));
	const instrumentCount = uniqueInstruments.size;

	// Get max BPM achieved
	const maxBpm = Math.max(...sessions.map((s) => s.finalBpm), 0);

	// Get completion count
	const completedSessions = sessions.filter((s) => s.completionRate && s.completionRate >= 0.9);
	const completionCount = completedSessions.length;

	// Get AI recommendation usage
	const aiSessions = sessions.filter((s) => s.contentSource === 'ai_recommended');
	const aiRecommendationCount = aiSessions.length;

	// Check each achievement
	for (const achievement of allAchievements) {
		const existing = userAchievementMap.get(achievement.id);
		let progress = 0;
		let shouldUnlock = false;

		switch (achievement.code) {
			case 'practice_1h':
				progress = Math.min(100, Math.round((totalMinutes / 60) * 100));
				shouldUnlock = totalHours >= 1 && !existing;
				break;
			case 'practice_10h':
				progress = Math.min(100, Math.round((totalMinutes / 600) * 100));
				shouldUnlock = totalHours >= 10 && !existing;
				break;
			case 'practice_50h':
				progress = Math.min(100, Math.round((totalMinutes / 3000) * 100));
				shouldUnlock = totalHours >= 50 && !existing;
				break;
			case 'practice_100h':
				progress = Math.min(100, Math.round((totalMinutes / 6000) * 100));
				shouldUnlock = totalHours >= 100 && !existing;
				break;
			case 'practice_500h':
				progress = Math.min(100, Math.round((totalMinutes / 30000) * 100));
				shouldUnlock = totalHours >= 500 && !existing;
				break;
			case 'streak_3d':
				progress = Math.min(100, Math.round((streak / 3) * 100));
				shouldUnlock = streak >= 3 && !existing;
				break;
			case 'streak_7d':
				progress = Math.min(100, Math.round((streak / 7) * 100));
				shouldUnlock = streak >= 7 && !existing;
				break;
			case 'streak_14d':
				progress = Math.min(100, Math.round((streak / 14) * 100));
				shouldUnlock = streak >= 14 && !existing;
				break;
			case 'streak_30d':
				progress = Math.min(100, Math.round((streak / 30) * 100));
				shouldUnlock = streak >= 30 && !existing;
				break;
			case 'streak_100d':
				progress = Math.min(100, Math.round((streak / 100) * 100));
				shouldUnlock = streak >= 100 && !existing;
				break;
			case 'instruments_2':
				progress = Math.min(100, Math.round((instrumentCount / 2) * 100));
				shouldUnlock = instrumentCount >= 2 && !existing;
				break;
			case 'instruments_3':
				progress = Math.min(100, Math.round((instrumentCount / 3) * 100));
				shouldUnlock = instrumentCount >= 3 && !existing;
				break;
			case 'instruments_5':
				progress = Math.min(100, Math.round((instrumentCount / 5) * 100));
				shouldUnlock = instrumentCount >= 5 && !existing;
				break;
			case 'bpm_100':
				progress = Math.min(100, Math.round((maxBpm / 100) * 100));
				shouldUnlock = maxBpm >= 100 && !existing;
				break;
			case 'bpm_150':
				progress = Math.min(100, Math.round((maxBpm / 150) * 100));
				shouldUnlock = maxBpm >= 150 && !existing;
				break;
			case 'bpm_200':
				progress = Math.min(100, Math.round((maxBpm / 200) * 100));
				shouldUnlock = maxBpm >= 200 && !existing;
				break;
			case 'bpm_250':
				progress = Math.min(100, Math.round((maxBpm / 250) * 100));
				shouldUnlock = maxBpm >= 250 && !existing;
				break;
			case 'complete_first':
				progress = completionCount > 0 ? 100 : 0;
				shouldUnlock = completionCount >= 1 && !existing;
				break;
			case 'complete_10':
				progress = Math.min(100, Math.round((completionCount / 10) * 100));
				shouldUnlock = completionCount >= 10 && !existing;
				break;
			case 'complete_50':
				progress = Math.min(100, Math.round((completionCount / 50) * 100));
				shouldUnlock = completionCount >= 50 && !existing;
				break;
			case 'ai_recommend_5':
				progress = Math.min(100, Math.round((aiRecommendationCount / 5) * 100));
				shouldUnlock = aiRecommendationCount >= 5 && !existing;
				break;
			case 'ai_recommend_20':
				progress = Math.min(100, Math.round((aiRecommendationCount / 20) * 100));
				shouldUnlock = aiRecommendationCount >= 20 && !existing;
				break;
			case 'ai_recommend_50':
				progress = Math.min(100, Math.round((aiRecommendationCount / 50) * 100));
				shouldUnlock = aiRecommendationCount >= 50 && !existing;
				break;
		}

		if (shouldUnlock) {
			// Unlock achievement
			await db.insert(table.userAchievement).values({
				id: generateId(),
				userId,
				achievementId: achievement.id,
				unlockedAt: new Date(),
				progress: 100
			});
			unlocked.push(achievement.id);
		} else if (existing && existing.progress !== progress) {
			// Update progress
			await db
				.update(table.userAchievement)
				.set({ progress })
				.where(eq(table.userAchievement.id, existing.id));
			updated.push({ achievementId: achievement.id, progress });
		} else if (!existing && progress > 0) {
			// Create progress entry
			await db.insert(table.userAchievement).values({
				id: generateId(),
				userId,
				achievementId: achievement.id,
				progress
			});
			updated.push({ achievementId: achievement.id, progress });
		}
	}

	return { unlocked, updated };
}

function calculateStreak(sessions: Array<{ startedAt: Date }>): number {
	if (sessions.length === 0) return 0;

	// Sort by date descending
	const sorted = [...sessions].sort(
		(a, b) => b.startedAt.getTime() - a.startedAt.getTime()
	);

	// Group by date
	const byDate = new Map<string, Array<{ startedAt: Date }>>();
	for (const session of sorted) {
		const dateKey = session.startedAt.toISOString().split('T')[0];
		if (!byDate.has(dateKey)) {
			byDate.set(dateKey, []);
		}
		byDate.get(dateKey)!.push(session);
	}

	// Calculate consecutive days
	let streak = 0;
	const today = new Date();
	today.setHours(0, 0, 0, 0);

	for (let i = 0; i < 365; i++) {
		const checkDate = new Date(today);
		checkDate.setDate(today.getDate() - i);
		const dateKey = checkDate.toISOString().split('T')[0];

		if (byDate.has(dateKey)) {
			streak++;
		} else if (i > 0) {
			// Break streak if gap found
			break;
		}
	}

	return streak;
}

// Initialize default achievements
export async function initializeAchievements() {
	const achievements = [
		// Practice hours
		{ code: 'practice_1h', title: '첫 시간', description: '1시간 연습 달성', category: 'practice', threshold: 60 },
		{ code: 'practice_10h', title: '열정의 시작', description: '10시간 연습 달성', category: 'practice', threshold: 600 },
		{ code: 'practice_50h', title: '연습 마니아', description: '50시간 연습 달성', category: 'practice', threshold: 3000 },
		{ code: 'practice_100h', title: '마스터 연습생', description: '100시간 연습 달성', category: 'practice', threshold: 6000 },
		{ code: 'practice_500h', title: '전설의 연습생', description: '500시간 연습 달성', category: 'practice', threshold: 30000 },
		// Streaks
		{ code: 'streak_3d', title: '3일 연속', description: '3일 연속 연습', category: 'streak', threshold: 3 },
		{ code: 'streak_7d', title: '일주일의 기적', description: '7일 연속 연습', category: 'streak', threshold: 7 },
		{ code: 'streak_14d', title: '2주 도전', description: '14일 연속 연습', category: 'streak', threshold: 14 },
		{ code: 'streak_30d', title: '한 달의 약속', description: '30일 연속 연습', category: 'streak', threshold: 30 },
		{ code: 'streak_100d', title: '100일의 기적', description: '100일 연속 연습', category: 'streak', threshold: 100 },
		// Instruments
		{ code: 'instruments_2', title: '다재다능', description: '2개 악기 연습', category: 'instruments', threshold: 2 },
		{ code: 'instruments_3', title: '만능 연주자', description: '3개 악기 연습', category: 'instruments', threshold: 3 },
		{ code: 'instruments_5', title: '악기 컬렉터', description: '5개 악기 연습', category: 'instruments', threshold: 5 },
		// BPM
		{ code: 'bpm_100', title: '100 BPM 달성', description: '100 BPM 달성', category: 'bpm', threshold: 100 },
		{ code: 'bpm_150', title: '150 BPM 달성', description: '150 BPM 달성', category: 'bpm', threshold: 150 },
		{ code: 'bpm_200', title: '200 BPM 달성', description: '200 BPM 달성', category: 'bpm', threshold: 200 },
		{ code: 'bpm_250', title: '250 BPM 달성', description: '250 BPM 달성', category: 'bpm', threshold: 250 },
		// Completion
		{ code: 'complete_first', title: '첫 완주', description: '첫 곡 완주', category: 'completion', threshold: 1 },
		{ code: 'complete_10', title: '완주 마스터', description: '10곡 완주', category: 'completion', threshold: 10 },
		{ code: 'complete_50', title: '완주 전설', description: '50곡 완주', category: 'completion', threshold: 50 },
		// AI Recommendations
		{ code: 'ai_recommend_5', title: 'AI와의 첫 만남', description: 'AI 추천 연습 5회 완료', category: 'ai', threshold: 5 },
		{ code: 'ai_recommend_20', title: 'AI 신뢰자', description: 'AI 추천 연습 20회 완료', category: 'ai', threshold: 20 },
		{ code: 'ai_recommend_50', title: 'AI 파트너', description: 'AI 추천 연습 50회 완료', category: 'ai', threshold: 50 }
	];

	for (const ach of achievements) {
		const existing = await db
			.select()
			.from(table.achievement)
			.where(eq(table.achievement.code, ach.code))
			.limit(1);

		if (existing.length === 0) {
			await db.insert(table.achievement).values({
				id: generateId(),
				code: ach.code,
				title: ach.title,
				description: ach.description,
				category: ach.category,
				threshold: ach.threshold
			});
		}
	}
}
