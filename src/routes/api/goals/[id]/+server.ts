import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';

export const PUT: RequestHandler = async ({ params, request, locals }) => {
	if (!locals.user) {
		error(401, 'Unauthorized');
	}

	const goalId = params.id;
	const body = await request.json();

	await db
		.update(table.practiceGoal)
		.set({
			...body,
			updatedAt: new Date()
		})
		.where(
			and(
				eq(table.practiceGoal.id, goalId),
				eq(table.practiceGoal.userId, locals.user.id)
			)
		);

	return json({ success: true });
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
	if (!locals.user) {
		error(401, 'Unauthorized');
	}

	const goalId = params.id;

	await db
		.delete(table.practiceGoal)
		.where(
			and(
				eq(table.practiceGoal.id, goalId),
				eq(table.practiceGoal.userId, locals.user.id)
			)
		);

	return json({ success: true });
};
