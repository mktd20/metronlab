import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import * as goals from '$lib/server/goals';
import { generateId } from '$lib/server/auth-utils';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const userId = locals.user!.id;

	const userGoals = await db
		.select()
		.from(table.practiceGoal)
		.where(eq(table.practiceGoal.userId, userId));

	// Calculate progress for each goal
	const goalsWithProgress = await Promise.all(
		userGoals.map(async (goal) => {
			const progress = await goals.calculateGoalProgress(userId, goal);
			return {
				...goal,
				progress
			};
		})
	);

	const userRoutines = await db
		.select()
		.from(table.practiceRoutine)
		.where(eq(table.practiceRoutine.userId, userId));

	// Get items for each routine
	const routinesWithItems = await Promise.all(
		userRoutines.map(async (routine) => {
			const items = await db
				.select({
					item: table.routineItem,
					instrument: table.instrument
				})
				.from(table.routineItem)
				.leftJoin(table.instrument, eq(table.routineItem.instrumentId, table.instrument.id))
				.where(eq(table.routineItem.routineId, routine.id))
				.orderBy(table.routineItem.order);

			return {
				...routine,
				items: items.map((i) => ({
					...i.item,
					instrument: i.instrument
				}))
			};
		})
	);

	return {
		goals: goalsWithProgress,
		routines: routinesWithItems
	};
};

export const actions: Actions = {
	create: async ({ request, locals }) => {
		const formData = await request.formData();
		const type = formData.get('type') as string;
		const targetType = formData.get('targetType') as string;
		const targetValue = Number(formData.get('targetValue'));
		const description = formData.get('description') as string | null;

		if (!type || !targetType || !targetValue) {
			return fail(400, { error: '필수 필드가 누락되었습니다.' });
		}

		const goalId = generateId();

		await db.insert(table.practiceGoal).values({
			id: goalId,
			userId: locals.user!.id,
			type,
			targetType,
			targetValue,
			description: description || null,
			isActive: true
		});

		return { success: true };
	}
};
