import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq, and, like, or, ne, inArray } from 'drizzle-orm';

export const GET: RequestHandler = async ({ url, locals }) => {
	if (!locals.user) {
		error(401, 'Unauthorized');
	}

	const query = url.searchParams.get('q') || '';
	const limit = Number(url.searchParams.get('limit')) || 20;

	let users;
	if (query) {
		users = await db
			.select({
				id: table.user.id,
				displayName: table.user.displayName,
				avatarUrl: table.user.avatarUrl,
				email: table.user.email
			})
			.from(table.user)
			.where(
				and(
					ne(table.user.id, locals.user.id),
					or(
						like(table.user.displayName, `%${query}%`),
						like(table.user.email, `%${query}%`)
					)
				)
			)
			.limit(limit);
	} else {
		users = await db
			.select({
				id: table.user.id,
				displayName: table.user.displayName,
				avatarUrl: table.user.avatarUrl,
				email: table.user.email
			})
			.from(table.user)
			.where(ne(table.user.id, locals.user.id))
			.limit(limit);
	}

	// Check follow status
	const userIds = users.map((u) => u.id);
	const follows = userIds.length > 0
		? await db
				.select()
				.from(table.follow)
				.where(
					and(
						eq(table.follow.followerId, locals.user.id),
						inArray(table.follow.followingId, userIds)
					)
				)
		: [];

	const followingIds = new Set(follows.map((f) => f.followingId));

	const usersWithFollowStatus = users.map((u) => ({
		...u,
		isFollowing: followingIds.has(u.id)
	}));

	return json({ success: true, users: usersWithFollowStatus });
};
