import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq, and, or, like } from 'drizzle-orm';

export const GET: RequestHandler = async ({ url, locals }) => {
	const instrument = url.searchParams.get('instrument');
	const difficulty = url.searchParams.get('difficulty');
	const genre = url.searchParams.get('genre');
	const search = url.searchParams.get('search');
	const source = url.searchParams.get('source') || 'builtin,community';

	const conditions = [];

	// Public sheets or user's own sheets
	if (locals.user) {
		conditions.push(
			or(
				eq(table.sheetMusic.isPublic, true),
				eq(table.sheetMusic.uploadedBy, locals.user.id)
			)
		);
	} else {
		conditions.push(eq(table.sheetMusic.isPublic, true));
	}

	// Source filter
	if (source) {
		const sources = source.split(',');
		conditions.push(
			or(...sources.map((s) => eq(table.sheetMusic.source, s.trim())))
		);
	}

	if (instrument) {
		conditions.push(eq(table.sheetMusic.instrumentType, instrument));
	}

	if (difficulty) {
		conditions.push(eq(table.sheetMusic.difficulty, difficulty));
	}

	if (genre) {
		conditions.push(eq(table.sheetMusic.genre, genre));
	}

	if (search) {
		conditions.push(
			or(
				like(table.sheetMusic.title, `%${search}%`),
				like(table.sheetMusic.artist || '', `%${search}%`)
			)
		);
	}

	const sheets = await db
		.select({
			id: table.sheetMusic.id,
			title: table.sheetMusic.title,
			artist: table.sheetMusic.artist,
			instrumentType: table.sheetMusic.instrumentType,
			difficulty: table.sheetMusic.difficulty,
			genre: table.sheetMusic.genre,
			source: table.sheetMusic.source,
			createdAt: table.sheetMusic.createdAt
		})
		.from(table.sheetMusic)
		.where(and(...conditions))
		.limit(100);

	return json({ success: true, sheets });
};
