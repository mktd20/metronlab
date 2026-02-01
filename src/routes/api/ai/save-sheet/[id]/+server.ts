import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';

export const POST: RequestHandler = async ({ params, locals }) => {
	if (!locals.user) {
		error(401, 'Unauthorized');
	}

	const sheetId = params.id;

	await db
		.update(table.aiGeneratedSheet)
		.set({
			isSaved: true,
			updatedAt: new Date()
		})
		.where(
			and(
				eq(table.aiGeneratedSheet.id, sheetId),
				eq(table.aiGeneratedSheet.userId, locals.user.id)
			)
		);

	return json({ success: true });
};
