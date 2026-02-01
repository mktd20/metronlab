import { error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const [result] = await db
		.select({
			session: table.practiceSession,
			instrument: table.instrument
		})
		.from(table.practiceSession)
		.leftJoin(table.instrument, eq(table.practiceSession.instrumentId, table.instrument.id))
		.where(
			and(
				eq(table.practiceSession.id, params.id),
				eq(table.practiceSession.userId, locals.user!.id)
			)
		);

	if (!result) {
		error(404, '세션을 찾을 수 없습니다');
	}

	return {
		practiceSession: result.session,
		instrument: result.instrument
	};
};
