import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	const page = Number(url.searchParams.get('page')) || 1;
	const limit = 20;
	const offset = (page - 1) * limit;

	const sessions = await db
		.select({
			id: table.practiceSession.id,
			startedAt: table.practiceSession.startedAt,
			endedAt: table.practiceSession.endedAt,
			durationSeconds: table.practiceSession.durationSeconds,
			contentType: table.practiceSession.contentType,
			contentTitle: table.practiceSession.contentTitle,
			initialBpm: table.practiceSession.initialBpm,
			notationMode: table.practiceSession.notationMode,
			completionRate: table.practiceSession.completionRate,
			satisfactionRating: table.practiceSession.satisfactionRating,
			userComment: table.practiceSession.userComment,
			instrumentName: table.instrument.name,
			instrumentType: table.instrument.type
		})
		.from(table.practiceSession)
		.leftJoin(table.instrument, eq(table.practiceSession.instrumentId, table.instrument.id))
		.where(eq(table.practiceSession.userId, locals.user!.id))
		.orderBy(desc(table.practiceSession.startedAt))
		.limit(limit)
		.offset(offset);

	return { sessions, page };
};
