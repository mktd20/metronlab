import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq, desc, and } from 'drizzle-orm';

export const GET: RequestHandler = async ({ url, locals }) => {
	if (!locals.user) {
		error(401, 'Unauthorized');
	}

	const instrument = url.searchParams.get('instrument');
	const saved = url.searchParams.get('saved') === 'true';

	const conditions = [eq(table.aiGeneratedSheet.userId, locals.user.id)];
	if (instrument) {
		conditions.push(eq(table.aiGeneratedSheet.instrumentType, instrument));
	}
	if (saved) {
		conditions.push(eq(table.aiGeneratedSheet.isSaved, true));
	}

	const sheets = await db
		.select()
		.from(table.aiGeneratedSheet)
		.where(and(...conditions))
		.orderBy(desc(table.aiGeneratedSheet.createdAt));

	return json({
		success: true,
		sheets: sheets.map((s) => ({
			id: s.id,
			title: s.title,
			description: s.description,
			difficulty: s.difficulty,
			suggestedBpm: s.suggestedBpm,
			targetBpm: s.targetBpm,
			timeSignature: s.timeSignature,
			keySignature: s.keySignature,
			bars: s.bars,
			focusAreas: s.focusAreas,
			isSaved: s.isSaved,
			timesPracticed: s.timesPracticed,
			createdAt: s.createdAt
		}))
	});
};
