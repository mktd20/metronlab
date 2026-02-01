import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq, desc, and, inArray } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	const limit = Number(url.searchParams.get('limit')) || 20;
	const offset = Number(url.searchParams.get('offset')) || 0;

	// Get users that current user follows
	// Handle case where follow table might not exist yet
	let following = [];
	try {
		following = await db
			.select({ followingId: table.follow.followingId })
			.from(table.follow)
			.where(eq(table.follow.followerId, locals.user!.id));
	} catch (error: any) {
		// If follow table doesn't exist yet or query fails, use empty array
		console.error('Error fetching follows (table may not exist):', error?.message || error);
		following = [];
	}

	const followingIds = following.map((f) => f.followingId);
	followingIds.push(locals.user!.id); // Include own posts

	// Get feed posts from followed users and self
	// Handle empty array case for inArray
	const posts = followingIds.length > 0
		? await db
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
				.offset(offset)
		: [];

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
	const userReactions = reactions.filter((r) => r.userId === locals.user!.id);
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

	return {
		posts: feedPosts
	};
};
