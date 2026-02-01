import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { generateId } from '$lib/server/auth-utils';

export const GET: RequestHandler = async ({ params, locals }) => {
	if (!locals.user) {
		error(401, 'Unauthorized');
	}

	const routineId = params.id;

	const [routine] = await db
		.select()
		.from(table.practiceRoutine)
		.where(
			and(
				eq(table.practiceRoutine.id, routineId),
				eq(table.practiceRoutine.userId, locals.user.id)
			)
		)
		.limit(1);

	if (!routine) {
		error(404, 'Routine not found');
	}

	const items = await db
		.select({
			item: table.routineItem,
			instrument: table.instrument
		})
		.from(table.routineItem)
		.leftJoin(table.instrument, eq(table.routineItem.instrumentId, table.instrument.id))
		.where(eq(table.routineItem.routineId, routineId))
		.orderBy(table.routineItem.order);

	return json({
		success: true,
		routine: {
			...routine,
			items: items.map((i) => ({
				...i.item,
				instrument: i.instrument
			}))
		}
	});
};

export const PUT: RequestHandler = async ({ params, request, locals }) => {
	if (!locals.user) {
		error(401, 'Unauthorized');
	}

	const routineId = params.id;
	const body = await request.json();
	const { name, description, isActive, items } = body;

	await db
		.update(table.practiceRoutine)
		.set({
			name,
			description,
			isActive,
			updatedAt: new Date()
		})
		.where(
			and(
				eq(table.practiceRoutine.id, routineId),
				eq(table.practiceRoutine.userId, locals.user.id)
			)
		);

	// Update items if provided
	if (items && Array.isArray(items)) {
		// Delete existing items
		await db
			.delete(table.routineItem)
			.where(eq(table.routineItem.routineId, routineId));

		// Insert new items
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

	return json({ success: true });
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
	if (!locals.user) {
		error(401, 'Unauthorized');
	}

	const routineId = params.id;

	// Delete items first
	await db.delete(table.routineItem).where(eq(table.routineItem.routineId, routineId));

	// Delete routine
	await db
		.delete(table.practiceRoutine)
		.where(
			and(
				eq(table.practiceRoutine.id, routineId),
				eq(table.practiceRoutine.userId, locals.user.id)
			)
		);

	return json({ success: true });
};
