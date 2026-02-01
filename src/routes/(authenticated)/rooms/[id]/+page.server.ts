import { error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
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

	// Check if current user is a participant
	const isParticipant = participants.some((p) => p.participant.userId === locals.user!.id);

	return {
		room: {
			...room.room,
			host: room.host,
			participants: participants.map((p) => ({
				...p.participant,
				user: p.user
			}))
		},
		isParticipant
	};
};
