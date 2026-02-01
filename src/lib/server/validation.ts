import { z } from 'zod';

// ─── Common Schemas ──────────────────────────────────
export const idSchema = z.string().min(1).max(100);
export const emailSchema = z.string().email().max(255);
export const passwordSchema = z.string().min(8).max(100);
export const displayNameSchema = z.string().min(1).max(100);

// ─── Practice Session Schemas ────────────────────────
export const practiceSessionStartSchema = z.object({
	instrumentId: idSchema,
	contentType: z.enum(['song', 'scale', 'technique', 'free', 'ai_generated']),
	contentTitle: z.string().max(200).optional(),
	contentSource: z.enum(['ai_generated', 'ai_recommended', 'user_selected', 'custom']).optional(),
	aiSheetId: idSchema.optional(),
	difficulty: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).optional(),
	initialBpm: z.number().int().min(30).max(300).optional(),
	timeSignature: z.string().regex(/^\d+\/\d+$/).optional(),
	notationMode: z.enum(['note', 'tab']).optional()
});

export const practiceSessionEndSchema = z.object({
	sessionId: idSchema,
	durationSeconds: z.number().int().min(0),
	finalBpm: z.number().int().min(30).max(300).optional(),
	completionRate: z.number().min(0).max(1).optional(),
	sessionData: z.record(z.any()).optional(),
	userComment: z.string().max(1000).optional(),
	quickTags: z.array(z.string()).max(10).optional(),
	satisfactionRating: z.number().int().min(1).max(5).optional()
});

// ─── Goals & Routines Schemas ────────────────────────
export const practiceGoalSchema = z.object({
	type: z.enum(['daily', 'weekly', 'monthly']),
	targetType: z.enum(['time', 'sessions', 'bpm']),
	targetValue: z.number().int().min(1),
	instrumentId: idSchema.optional(),
	description: z.string().max(500).optional()
});

export const practiceRoutineSchema = z.object({
	name: z.string().min(1).max(100),
	description: z.string().max(500).optional(),
	items: z.array(
		z.object({
			order: z.number().int().min(0),
			title: z.string().min(1).max(100),
			type: z.enum(['warmup', 'scale', 'technique', 'song', 'cooldown', 'free']),
			durationSeconds: z.number().int().min(1).max(3600),
			instrumentId: idSchema.optional(),
			settings: z.record(z.any()).optional()
		})
	).min(1).max(20)
});

// ─── Social Schemas ──────────────────────────────────
export const feedPostSchema = z.object({
	sessionId: idSchema,
	content: z.string().max(1000).optional()
});

export const reactionSchema = z.object({
	type: z.enum(['like', 'cheer', 'fire'])
});

// ─── Practice Room Schemas ──────────────────────────
export const practiceRoomSchema = z.object({
	name: z.string().min(1).max(100),
	description: z.string().max(500).optional(),
	maxParticipants: z.number().int().min(2).max(4).optional(),
	bpm: z.number().int().min(30).max(300).optional(),
	timeSignature: z.string().regex(/^\d+\/\d+$/).optional()
});

export const roomActionSchema = z.object({
	action: z.enum(['join', 'leave', 'update'])
});

// ─── AI Schemas ──────────────────────────────────────
export const aiGenerateSheetSchema = z.object({
	instrument: z.string().min(1).max(50),
	generationParams: z
		.object({
			difficulty: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).optional(),
			focusArea: z.string().max(100).optional(),
			durationBars: z.number().int().min(4).max(64).optional(),
			bpmSuggestion: z.boolean().optional(),
			scaleType: z.string().max(50).optional(),
			scaleKey: z.string().max(10).optional()
		})
		.optional()
});

// ─── Instrument Schemas ──────────────────────────────
export const instrumentSchema = z.object({
	type: z.string().min(1).max(50),
	name: z.string().min(1).max(100),
	isCustom: z.boolean().optional(),
	settings: z.record(z.any()).optional()
});

// ─── Sheet Music Schemas ─────────────────────────────
export const sheetUploadSchema = z.object({
	title: z.string().min(1).max(200),
	artist: z.string().max(200).optional(),
	instrumentType: z.string().min(1).max(50),
	difficulty: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).optional(),
	genre: z.string().max(50).optional(),
	noteData: z.record(z.any()).optional(),
	tabData: z.record(z.any()).optional(),
	midiData: z.string().optional(),
	isPublic: z.boolean().optional()
});

// ─── Helper Functions ───────────────────────────────
export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): T {
	try {
		return schema.parse(data);
	} catch (error) {
		if (error instanceof z.ZodError) {
			throw new Error(`Validation error: ${error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')}`);
		}
		throw error;
	}
}
