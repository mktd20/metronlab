import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq, desc, and, sql } from 'drizzle-orm';
import { generateId } from '$lib/server/auth-utils';
import { practiceRoomSchema, validateRequest } from '$lib/server/validation';

export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.user) {
		error(401, 'Unauthorized');
	}

	// Get active rooms
	const rooms = await db
		.select({
			room: table.practiceRoom,
			host: table.user,
			participantCount: sql<number>`COUNT(${table.roomParticipant.id})`
		})
		.from(table.practiceRoom)
		.leftJoin(table.user, eq(table.practiceRoom.hostId, table.user.id))
		.leftJoin(table.roomParticipant, eq(table.practiceRoom.id, table.roomParticipant.roomId))
		.where(eq(table.practiceRoom.isActive, true))
		.groupBy(table.practiceRoom.id)
		.orderBy(desc(table.practiceRoom.createdAt));

	return json({ success: true, rooms });
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

	const validated = validateRequest(practiceRoomSchema, body);

	// Generate unique invite code
	const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

	const roomId = generateId();
	await db.insert(table.practiceRoom).values({
		id: roomId,
		hostId: locals.user.id,
		name: validated.name,
		description: validated.description || null,
		maxParticipants: validated.maxParticipants || 4,
		currentBpm: validated.bpm || 120,
		timeSignature: validated.timeSignature || '4/4',
		inviteCode
	});

	// Add host as participant
	const participantId = generateId();
	await db.insert(table.roomParticipant).values({
		id: participantId,
		roomId,
		userId: locals.user.id
	});

	return json({ success: true, roomId, inviteCode });
};
