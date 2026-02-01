import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq, desc, and, inArray } from 'drizzle-orm';
import { generateId } from '$lib/server/auth-utils';
import { feedPostSchema, validateRequest } from '$lib/server/validation';

export const GET: RequestHandler = async ({ url, locals }) => {
	if (!locals.user) {
		error(401, 'Unauthorized');
	}

	const limit = Number(url.searchParams.get('limit')) || 20;
	const offset = Number(url.searchParams.get('offset')) || 0;

	// Get users that current user follows
	const following = await db
		.select({ followingId: table.follow.followingId })
		.from(table.follow)
		.where(eq(table.follow.followerId, locals.user.id));

	const followingIds = following.map((f) => f.followingId);
	followingIds.push(locals.user.id); // Include own posts

	// Get feed posts from followed users and self
	const posts = await db
		.select({
			post: table.feedPost,
			user: table.user,
			session: table.practiceSession,
			instrument: table.instrument
		})
		.from(table.feedPost)
		.leftJoin(table.user, eq(table.feedPost.userId, table.user.id))
		.leftJoin(table.practiceSession, eq(table.feedPost.sessionId, table.practiceSession.id))
		.leftJoin(table.instrument, eq(table.practiceSession.instrumentId, table.instrument.id))
		.where(
			and(
				inArray(table.feedPost.userId, followingIds),
				eq(table.feedPost.isPublic, true)
			)
		)
		.orderBy(desc(table.feedPost.createdAt))
		.limit(limit)
		.offset(offset);

	// Get reactions for each post
	const postIds = posts.map((p) => p.post.id);
	const reactions = postIds.length > 0
		? await db
				.select()
				.from(table.reaction)
				.where(inArray(table.reaction.postId, postIds))
		: [];

	// Group reactions by post
	const reactionsByPost = reactions.reduce((acc, r) => {
		if (!acc[r.postId]) {
			acc[r.postId] = [];
		}
		acc[r.postId].push(r);
		return acc;
	}, {} as Record<string, typeof reactions>);

	// Check which posts current user has reacted to
	const userReactions = reactions.filter((r) => r.userId === locals.user.id);
	const userReactionByPost = userReactions.reduce((acc, r) => {
		acc[r.postId] = r.type;
		return acc;
	}, {} as Record<string, string>);

	const feedPosts = posts.map((p) => ({
		id: p.post.id,
		userId: p.post.userId,
		sessionId: p.post.sessionId,
		content: p.post.content,
		createdAt: p.post.createdAt,
		user: {
			id: p.user?.id,
			displayName: p.user?.displayName,
			avatarUrl: p.user?.avatarUrl
		},
		session: p.session
			? {
					id: p.session.id,
					contentType: p.session.contentType,
					contentTitle: p.session.contentTitle,
					durationSeconds: p.session.durationSeconds,
					initialBpm: p.session.initialBpm,
					instrumentName: p.instrument?.name,
					instrumentType: p.instrument?.type
				}
			: null,
		reactions: reactionsByPost[p.post.id] || [],
		userReaction: userReactionByPost[p.post.id] || null,
		reactionCount: (reactionsByPost[p.post.id] || []).length
	}));

	return json({ success: true, posts: feedPosts });
};

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		error(401, 'Unauthorized');
	}

	let body;
	try {
		body = await request.json();
	} catch {
		error(400, 'Invalid JSON');
	}

	const validated = validateRequest(feedPostSchema, body);

	// Verify session belongs to user
	const [session] = await db
		.select()
		.from(table.practiceSession)
		.where(
			and(
				eq(table.practiceSession.id, validated.sessionId),
				eq(table.practiceSession.userId, locals.user.id)
			)
		)
		.limit(1);

	if (!session) {
		error(404, 'Session not found');
	}

	const postId = generateId();
	await db.insert(table.feedPost).values({
		id: postId,
		userId: locals.user.id,
		sessionId: validated.sessionId,
		content: validated.content || null,
		isPublic: true
	});

	return json({ success: true, postId });
};
