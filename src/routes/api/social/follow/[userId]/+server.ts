import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { generateId } from '$lib/server/auth-utils';

export const POST: RequestHandler = async ({ params, locals }) => {
	if (!locals.user) {
		error(401, 'Unauthorized');
	}

	const targetUserId = params.userId;
	if (targetUserId === locals.user.id) {
		error(400, 'Cannot follow yourself');
	}

	// Check if already following
	const [existing] = await db
		.select()
		.from(table.follow)
		.where(
			and(
				eq(table.follow.followerId, locals.user.id),
				eq(table.follow.followingId, targetUserId)
			)
		)
		.limit(1);

	if (existing) {
		error(400, 'Already following this user');
	}

	const followId = generateId();
	await db.insert(table.follow).values({
		id: followId,
		followerId: locals.user.id,
		followingId: targetUserId
	});

	return json({ success: true });
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
	if (!locals.user) {
		error(401, 'Unauthorized');
	}

	const targetUserId = params.userId;

	await db
		.delete(table.follow)
		.where(
			and(
				eq(table.follow.followerId, locals.user.id),
				eq(table.follow.followingId, targetUserId)
			)
		);

	return json({ success: true });
};
