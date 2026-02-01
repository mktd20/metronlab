import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq, and, gte, desc, sql, count, sum } from 'drizzle-orm';
import * as goals from '$lib/server/goals';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const userId = locals.user!.id;
	const now = new Date();
	const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	const weekStart = new Date(todayStart);
	weekStart.setDate(weekStart.getDate() - weekStart.getDay());
	const thirtyDaysAgo = new Date(todayStart);
	thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

	// Parallelize database queries for better performance
	const [todayStats, weekStats, totalStats, allSessionDates, recentSessions, trendData, instruments] = await Promise.all([
		// Today stats
		db
			.select({
				totalSeconds: sum(table.practiceSession.durationSeconds),
				sessionCount: count()
			})
			.from(table.practiceSession)
			.where(
				and(
					eq(table.practiceSession.userId, userId),
					gte(table.practiceSession.startedAt, todayStart)
				)
			)
			.then((r) => r[0]),

		// Week stats
		db
			.select({
				totalSeconds: sum(table.practiceSession.durationSeconds),
				sessionCount: count()
			})
			.from(table.practiceSession)
			.where(
				and(
					eq(table.practiceSession.userId, userId),
					gte(table.practiceSession.startedAt, weekStart)
				)
			)
			.then((r) => r[0]),

		// Total stats
		db
			.select({ sessionCount: count() })
			.from(table.practiceSession)
			.where(eq(table.practiceSession.userId, userId))
			.then((r) => r[0]),

		// Streak calculation - only get dates, not full sessions
		db
			.select({ date: table.practiceSession.startedAt })
			.from(table.practiceSession)
			.where(eq(table.practiceSession.userId, userId))
			.orderBy(desc(table.practiceSession.startedAt)),

		// Recent sessions
		db
			.select({
				id: table.practiceSession.id,
				instrumentId: table.practiceSession.instrumentId,
				startedAt: table.practiceSession.startedAt,
				durationSeconds: table.practiceSession.durationSeconds,
				contentType: table.practiceSession.contentType,
				contentTitle: table.practiceSession.contentTitle,
				initialBpm: table.practiceSession.initialBpm,
				completionRate: table.practiceSession.completionRate,
				satisfactionRating: table.practiceSession.satisfactionRating,
				instrumentName: table.instrument.name,
				instrumentType: table.instrument.type
			})
			.from(table.practiceSession)
			.leftJoin(table.instrument, eq(table.practiceSession.instrumentId, table.instrument.id))
			.where(eq(table.practiceSession.userId, userId))
			.orderBy(desc(table.practiceSession.startedAt))
			.limit(5),

		// 30-day trend data
		db
			.select({
				date: table.practiceSession.startedAt,
				totalSeconds: table.practiceSession.durationSeconds
			})
			.from(table.practiceSession)
			.where(
				and(
					eq(table.practiceSession.userId, userId),
					gte(table.practiceSession.startedAt, thirtyDaysAgo)
				)
			)
			.orderBy(table.practiceSession.startedAt),

		// Instruments
		db
			.select()
			.from(table.instrument)
			.where(eq(table.instrument.userId, userId))
	]);

	let streak = 0;
	if (allSessionDates.length > 0) {
		const uniqueDays = new Set(
			allSessionDates.map((s) => {
				const d = new Date(s.date);
				return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
			})
		);
		const checkDate = new Date(todayStart);
		// Check today or yesterday first
		const todayKey = `${checkDate.getFullYear()}-${checkDate.getMonth()}-${checkDate.getDate()}`;
		if (!uniqueDays.has(todayKey)) {
			checkDate.setDate(checkDate.getDate() - 1);
		}
		while (true) {
			const key = `${checkDate.getFullYear()}-${checkDate.getMonth()}-${checkDate.getDate()}`;
			if (uniqueDays.has(key)) {
				streak++;
				checkDate.setDate(checkDate.getDate() - 1);
			} else {
				break;
			}
		}
	}

	return {
		summary: {
			todayMinutes: Math.round(Number(todayStats?.totalSeconds || 0) / 60),
			weekMinutes: Math.round(Number(weekStats?.totalSeconds || 0) / 60),
			streak,
			totalSessions: totalStats?.sessionCount || 0
		},
		recentSessions,
		trendData: trendData.map((d) => ({
			date: d.date.toISOString().split('T')[0],
			minutes: Math.round(d.totalSeconds / 60)
		})),
		instruments
	};
};
