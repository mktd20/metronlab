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

	const roomId = params.id;

	const [room] = await db
		.select({
			room: table.practiceRoom,
			host: table.user
		})
		.from(table.practiceRoom)
		.leftJoin(table.user, eq(table.practiceRoom.hostId, table.user.id))
		.where(eq(table.practiceRoom.id, roomId))
		.limit(1);

	if (!room) {
		error(404, 'Room not found');
	}

	// Get participants
	const participants = await db
		.select({
			participant: table.roomParticipant,
			user: table.user
		})
		.from(table.roomParticipant)
		.leftJoin(table.user, eq(table.roomParticipant.userId, table.user.id))
		.where(eq(table.roomParticipant.roomId, roomId));

	return json({
		success: true,
		room: {
			...room.room,
			host: room.host,
			participants: participants.map((p) => ({
				...p.participant,
				user: p.user
			}))
		}
	});
};

export const POST: RequestHandler = async ({ params, request, locals }) => {
	if (!locals.user) {
		error(401, 'Unauthorized');
	}

	const roomId = params.id;
	const body = await request.json();
	const { action } = body;

	if (action === 'join') {
		// Check if room exists and is active
		const [room] = await db
			.select()
			.from(table.practiceRoom)
			.where(
				and(
					eq(table.practiceRoom.id, roomId),
					eq(table.practiceRoom.isActive, true)
				)
			)
			.limit(1);

		if (!room) {
			error(404, 'Room not found');
		}

		// Check if already a participant
		const [existing] = await db
			.select()
			.from(table.roomParticipant)
			.where(
				and(
					eq(table.roomParticipant.roomId, roomId),
					eq(table.roomParticipant.userId, locals.user.id)
				)
			)
			.limit(1);

		if (existing) {
			return json({ success: true, message: 'Already in room' });
		}

		// Check participant limit
		const participantCount = await db
			.select()
			.from(table.roomParticipant)
			.where(eq(table.roomParticipant.roomId, roomId));

		if (participantCount.length >= room.maxParticipants) {
			error(400, 'Room is full');
		}

		// Add participant
		const participantId = generateId();
		await db.insert(table.roomParticipant).values({
			id: participantId,
			roomId,
			userId: locals.user.id
		});

		return json({ success: true });
	} else if (action === 'leave') {
		await db
			.delete(table.roomParticipant)
			.where(
				and(
					eq(table.roomParticipant.roomId, roomId),
					eq(table.roomParticipant.userId, locals.user.id)
				)
			);

		return json({ success: true });
	}

	error(400, 'Invalid action');
};
