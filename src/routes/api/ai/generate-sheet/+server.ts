import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';
import * as aiService from '$lib/server/ai';
import { generateId } from '$lib/server/auth-utils';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		error(401, 'Unauthorized');
	}

	const body = await request.json();
	const { instrument, generationParams } = body;

	if (!instrument) {
		error(400, 'Instrument is required');
	}

	// If generating scale, add scale-specific parameters
	const isScalePractice = generationParams?.focusArea === 'scale';
	if (isScalePractice && !generationParams.scaleType) {
		// Default to common scales for beginners/intermediate
		const commonScales = ['major', 'minor', 'minor-pentatonic', 'major-pentatonic'];
		generationParams.scaleType = commonScales[Math.floor(Math.random() * commonScales.length)];
		generationParams.scaleKey = ['C', 'D', 'E', 'G', 'A'][Math.floor(Math.random() * 5)];
	}

	// Get user's recent sessions
	const recentSessions = await db
		.select()
		.from(table.practiceSession)
		.where(eq(table.practiceSession.userId, locals.user.id))
		.orderBy(desc(table.practiceSession.startedAt))
		.limit(10);

	// Calculate user profile
	const totalHours =
		recentSessions.reduce((sum, s) => sum + s.durationSeconds, 0) / 3600;
	const avgBpm =
		recentSessions.length > 0
			? recentSessions.reduce((sum, s) => sum + s.initialBpm, 0) / recentSessions.length
			: 120;
	const maxBpm = Math.max(...recentSessions.map((s) => s.finalBpm), 120);

	// Extract strengths/weaknesses from comments and tags
	const allComments = recentSessions
		.filter((s) => s.userComment)
		.map((s) => s.userComment as string);
	const allTags = recentSessions
		.filter((s) => s.quickTags)
		.flatMap((s) => (s.quickTags as string[]) || []);

	// Simple keyword extraction (can be enhanced with NLP)
	const weakAreas: string[] = [];
	if (allTags.some((t) => t.includes('어려움') || t.includes('불안정'))) {
		weakAreas.push('rhythm', 'timing');
	}
	if (allComments.some((c) => c.includes('손가락') || c.includes('약지'))) {
		weakAreas.push('finger_independence');
	}

	const userProfile = {
		level: 'intermediate', // Can be calculated from practice data
		totalPracticeHours: totalHours,
		avgBpm: Math.round(avgBpm),
		maxCleanBpm: maxBpm,
		strongAreas: ['basic_scales'], // Can be enhanced
		weakAreas: weakAreas.length > 0 ? weakAreas : ['arpeggio'],
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
			instrument,
			userProfile,
			recentSessions: sessionData,
			generationParams: generationParams || {
				difficulty: 'adaptive',
				focusArea: 'auto',
				durationBars: 16,
				bpmSuggestion: true
			}
		});

		// Save generated sheet
		const sheetId = generateId();
		await db.insert(table.aiGeneratedSheet).values({
			id: sheetId,
			userId: locals.user.id,
			instrumentType: instrument,
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
			generationContext: { userProfile, recentSessions: sessionData }
		});

		return json({ success: true, sheet: generatedSheet, sheetId });
	} catch (err) {
		console.error('Sheet generation error:', err);
		error(500, 'Failed to generate sheet');
	}
};
