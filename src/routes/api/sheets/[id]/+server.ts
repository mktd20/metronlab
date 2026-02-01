import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq, and, or } from 'drizzle-orm';

export const GET: RequestHandler = async ({ params, locals }) => {
	const sheetId = params.id;

	const conditions = [
		eq(table.sheetMusic.id, sheetId),
		or(
			eq(table.sheetMusic.isPublic, true),
			locals.user ? eq(table.sheetMusic.uploadedBy, locals.user.id) : eq(table.sheetMusic.isPublic, false)
		)
	];

	const [sheet] = await db
		.select()
		.from(table.sheetMusic)
		.where(and(...conditions))
		.limit(1);

	if (!sheet) {
		error(404, 'Sheet not found');
	}

	return json({ success: true, sheet });
};
