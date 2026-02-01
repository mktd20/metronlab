import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import * as aiService from '$lib/server/ai';
import { generateId } from '$lib/server/auth-utils';

export const POST: RequestHandler = async ({ params, locals, request }) => {
	if (!locals.user) {
		error(401, 'Unauthorized');
	}

	const sheetId = params.id;
	const body = await request.json().catch(() => ({}));
	const { generationParams } = body;

	// Get original sheet
	const [originalSheet] = await db
		.select()
		.from(table.aiGeneratedSheet)
		.where(
			and(
				eq(table.aiGeneratedSheet.id, sheetId),
				eq(table.aiGeneratedSheet.userId, locals.user.id)
			)
		);

	if (!originalSheet) {
		error(404, 'Sheet not found');
	}

	// Get user's recent sessions for context
	const recentSessions = await db
		.select()
		.from(table.practiceSession)
		.where(eq(table.practiceSession.userId, locals.user.id))
		.orderBy(desc(table.practiceSession.startedAt))
		.limit(10);

	const totalHours =
		recentSessions.reduce((sum, s) => sum + s.durationSeconds, 0) / 3600;
	const avgBpm =
		recentSessions.length > 0
			? recentSessions.reduce((sum, s) => sum + s.initialBpm, 0) / recentSessions.length
			: 120;

	const userProfile = {
		level: originalSheet.difficulty || 'intermediate',
		totalPracticeHours: totalHours,
		avgBpm: Math.round(avgBpm),
		maxCleanBpm: Math.max(...recentSessions.map((s) => s.finalBpm), 120),
		strongAreas: (originalSheet.focusAreas as string[]) || [],
		weakAreas: [],
		preferredGenres: []
	};

	const sessionData = recentSessions.map((s) => ({
		date: s.startedAt.toISOString().split('T')[0],
		bpm: s.initialBpm,
		completionRate: s.completionRate || 0,
		strugglePoints: [],
		userComment: s.userComment || undefined
	}));

	try {
		const generatedSheet = await aiService.generateSheet({
			instrument: originalSheet.instrumentType,
			userProfile,
			recentSessions: sessionData,
			generationParams: generationParams || {
				difficulty: 'adaptive',
				focusArea: 'auto',
				durationBars: originalSheet.bars || 16,
				bpmSuggestion: true
			}
		});

		// Save new generated sheet
		const newSheetId = generateId();
		await db.insert(table.aiGeneratedSheet).values({
			id: newSheetId,
			userId: locals.user.id,
			instrumentType: originalSheet.instrumentType,
			title: generatedSheet.title,
			description: generatedSheet.description,
			difficulty: generatedSheet.difficulty,
			suggestedBpm: generatedSheet.suggestedBpm,
			targetBpm: generatedSheet.targetBpm,
			timeSignature: generatedSheet.timeSignature,
			keySignature: generatedSheet.key,
			bars: generatedSheet.bars,
			focusAreas: generatedSheet.focusAreas,
			noteData: generatedSheet.noteData,
			tabData: generatedSheet.tabData,
			practiceTips: generatedSheet.practiceTips,
			progressionPlan: generatedSheet.progressionPlan,
			generationContext: { userProfile, recentSessions: sessionData, regeneratedFrom: sheetId }
		});

		return json({ success: true, sheet: generatedSheet, sheetId: newSheetId });
	} catch (err) {
		console.error('Sheet regeneration error:', err);
		error(500, 'Failed to regenerate sheet');
	}
};
