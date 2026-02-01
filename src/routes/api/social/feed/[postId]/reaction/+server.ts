import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { generateId } from '$lib/server/auth-utils';
import { reactionSchema, validateRequest } from '$lib/server/validation';

export const POST: RequestHandler = async ({ params, request, locals }) => {
	if (!locals.user) {
		error(401, 'Unauthorized');
	}

	const postId = params.postId;
	let body;
	try {
		body = await request.json();
	} catch {
		error(400, 'Invalid JSON');
	}

	const validated = validateRequest(reactionSchema, body);

	// Check if already reacted
	const [existing] = await db
		.select()
		.from(table.reaction)
		.where(
			and(
				eq(table.reaction.postId, postId),
				eq(table.reaction.userId, locals.user.id)
			)
		)
		.limit(1);

	if (existing) {
		// Update existing reaction
		await db
			.update(table.reaction)
			.set({ type: validated.type })
			.where(eq(table.reaction.id, existing.id));
	} else {
		// Create new reaction
		const reactionId = generateId();
		await db.insert(table.reaction).values({
			id: reactionId,
			postId,
			userId: locals.user.id,
			type: validated.type
		});
	}

	return json({ success: true });
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
	if (!locals.user) {
		error(401, 'Unauthorized');
	}

	const postId = params.postId;

	await db
		.delete(table.reaction)
		.where(
			and(
				eq(table.reaction.postId, postId),
				eq(table.reaction.userId, locals.user.id)
			)
		);

	return json({ success: true });
};
