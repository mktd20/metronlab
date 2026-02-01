import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { generateId } from '$lib/server/auth-utils';
import { practiceGoalSchema, validateRequest } from '$lib/server/validation';

export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.user) {
		error(401, 'Unauthorized');
	}

	const goals = await db
		.select({
			goal: table.practiceGoal,
			instrument: table.instrument
		})
		.from(table.practiceGoal)
		.leftJoin(table.instrument, eq(table.practiceGoal.instrumentId, table.instrument.id))
		.where(eq(table.practiceGoal.userId, locals.user.id))
		.orderBy(table.practiceGoal.createdAt);

	return json({
		success: true,
		goals: goals.map((g) => ({
			...g.goal,
			instrument: g.instrument
		}))
	});
};

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		error(401, 'Unauthorized');
	}

	const body = await request.json();
	const { type, targetType, targetValue, instrumentId, description } = body;

	if (!type || !targetType || targetValue === undefined) {
		error(400, 'Missing required fields');
	}

	const goalId = generateId();

	await db.insert(table.practiceGoal).values({
		id: goalId,
		userId: locals.user.id,
		type,
		targetType,
		targetValue,
		instrumentId: instrumentId || null,
		description: description || null,
		isActive: true
	});

	return json({ success: true, goalId });
};
