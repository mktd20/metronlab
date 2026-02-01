import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { generateId } from '$lib/server/auth-utils';

export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.user) {
		error(401, 'Unauthorized');
	}

	const routines = await db
		.select()
		.from(table.practiceRoutine)
		.where(eq(table.practiceRoutine.userId, locals.user.id))
		.orderBy(table.practiceRoutine.createdAt);

	// Get items for each routine
	const routinesWithItems = await Promise.all(
		routines.map(async (routine) => {
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

	return json({ success: true, routines: routinesWithItems });
};

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		error(401, 'Unauthorized');
	}

	const body = await request.json();
	const { name, description, items } = body;

	if (!name) {
		error(400, 'Name is required');
	}

	const routineId = generateId();

	await db.insert(table.practiceRoutine).values({
		id: routineId,
		userId: locals.user.id,
		name,
		description: description || null,
		isActive: true
	});

	// Insert items
	if (items && Array.isArray(items)) {
		for (let i = 0; i < items.length; i++) {
			const item = items[i];
			await db.insert(table.routineItem).values({
				id: generateId(),
				routineId,
				order: i,
				title: item.title,
				type: item.type,
				durationSeconds: item.durationSeconds,
				instrumentId: item.instrumentId || null,
				settings: item.settings || null
			});
		}
	}

	return json({ success: true, routineId });
};
