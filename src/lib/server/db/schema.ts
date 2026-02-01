import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// ─── Users ───────────────────────────────────────────
export const user = sqliteTable('user', {
	id: text('id').primaryKey(),
	email: text('email').notNull().unique(),
	hashedPassword: text('hashed_password').notNull(),
	displayName: text('display_name').notNull(),
	avatarUrl: text('avatar_url'),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`)
});

// ─── Sessions (Auth) ─────────────────────────────────
export const session = sqliteTable('session', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull()
});

// ─── Instruments ─────────────────────────────────────
export const instrument = sqliteTable('instrument', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	type: text('type').notNull(), // guitar, bass, drums, keyboard, violin, etc.
	name: text('name').notNull(),
	isCustom: integer('is_custom', { mode: 'boolean' }).notNull().default(false),
	settings: text('settings', { mode: 'json' }),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`)
});

// ─── Practice Sessions ───────────────────────────────
export const practiceSession = sqliteTable('practice_session', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	instrumentId: text('instrument_id')
		.notNull()
		.references(() => instrument.id),
	startedAt: integer('started_at', { mode: 'timestamp' }).notNull(),
	endedAt: integer('ended_at', { mode: 'timestamp' }),
	durationSeconds: integer('duration_seconds').notNull().default(0),
	contentType: text('content_type').notNull().default('free'), // song, scale, technique, free, ai_generated
	contentTitle: text('content_title'),
	contentSource: text('content_source').notNull().default('custom'), // ai_generated, ai_recommended, user_selected, custom
	aiSheetId: text('ai_sheet_id').references(() => aiGeneratedSheet.id),
	difficulty: text('difficulty').default('intermediate'), // beginner, intermediate, advanced, expert
	initialBpm: integer('initial_bpm').notNull().default(120),
	finalBpm: integer('final_bpm').notNull().default(120),
	timeSignature: text('time_signature').notNull().default('4/4'),
	notationMode: text('notation_mode').notNull().default('tab'), // note, tab
	completionRate: real('completion_rate').default(0),
	sessionData: text('session_data', { mode: 'json' }), // Full JSON structure
	userComment: text('user_comment'),
	quickTags: text('quick_tags', { mode: 'json' }), // string[]
	satisfactionRating: integer('satisfaction_rating'), // 1~5
	commentSubmittedAt: integer('comment_submitted_at', { mode: 'timestamp' }),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`)
});

// ─── Practice Tags ───────────────────────────────────
export const practiceTag = sqliteTable('practice_tag', {
	id: text('id').primaryKey(),
	sessionId: text('session_id')
		.notNull()
		.references(() => practiceSession.id),
	tag: text('tag').notNull()
});

// ─── AI Generated Sheets ─────────────────────────────
export const aiGeneratedSheet = sqliteTable('ai_generated_sheet', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	instrumentType: text('instrument_type').notNull(),
	title: text('title').notNull(),
	description: text('description'),
	difficulty: text('difficulty').notNull().default('intermediate'),
	suggestedBpm: integer('suggested_bpm').notNull().default(120),
	targetBpm: integer('target_bpm').notNull().default(120),
	timeSignature: text('time_signature').notNull().default('4/4'),
	keySignature: text('key_signature'),
	bars: integer('bars').notNull().default(16),
	focusAreas: text('focus_areas', { mode: 'json' }),
	noteData: text('note_data', { mode: 'json' }),
	tabData: text('tab_data', { mode: 'json' }),
	practiceTips: text('practice_tips', { mode: 'json' }),
	progressionPlan: text('progression_plan', { mode: 'json' }),
	generationContext: text('generation_context', { mode: 'json' }),
	isSaved: integer('is_saved', { mode: 'boolean' }).notNull().default(false),
	timesPracticed: integer('times_practiced').notNull().default(0),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`)
});

// ─── AI Analyses ─────────────────────────────────────
export const aiAnalysis = sqliteTable('ai_analysis', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	sessionId: text('session_id').references(() => practiceSession.id),
	type: text('type').notNull(), // session, weekly, monthly
	analysisData: text('analysis_data', { mode: 'json' }),
	summary: text('summary'),
	recommendations: text('recommendations', { mode: 'json' }),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`)
});

// ─── Achievements ────────────────────────────────────
export const achievement = sqliteTable('achievement', {
	id: text('id').primaryKey(),
	code: text('code').notNull().unique(),
	title: text('title').notNull(),
	description: text('description').notNull(),
	icon: text('icon'),
	category: text('category').notNull(),
	threshold: integer('threshold')
});

// ─── User Achievements ───────────────────────────────
export const userAchievement = sqliteTable('user_achievement', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	achievementId: text('achievement_id')
		.notNull()
		.references(() => achievement.id),
	unlockedAt: integer('unlocked_at', { mode: 'timestamp' }),
	progress: integer('progress').notNull().default(0)
});

// ─── Sheet Music ──────────────────────────────────────
export const sheetMusic = sqliteTable('sheet_music', {
	id: text('id').primaryKey(),
	title: text('title').notNull(),
	artist: text('artist'),
	instrumentType: text('instrument_type').notNull(),
	difficulty: text('difficulty').notNull().default('intermediate'),
	genre: text('genre'),
	noteData: text('note_data', { mode: 'json' }),
	tabData: text('tab_data', { mode: 'json' }),
	midiData: text('midi_data'), // Base64 encoded or file path
	source: text('source').notNull().default('builtin'), // builtin, user_upload, community
	uploadedBy: text('uploaded_by').references(() => user.id),
	isPublic: integer('is_public', { mode: 'boolean' }).notNull().default(false),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`)
});

// ─── Practice Goals ──────────────────────────────────
export const practiceGoal = sqliteTable('practice_goal', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	type: text('type').notNull(), // daily, weekly, monthly
	targetType: text('target_type').notNull(), // time, sessions, bpm
	targetValue: integer('target_value').notNull(),
	instrumentId: text('instrument_id').references(() => instrument.id),
	description: text('description'),
	isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`)
});

// ─── Practice Routines ───────────────────────────────
export const practiceRoutine = sqliteTable('practice_routine', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	name: text('name').notNull(),
	description: text('description'),
	isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`)
});

// ─── Routine Items ───────────────────────────────────
export const routineItem = sqliteTable('routine_item', {
	id: text('id').primaryKey(),
	routineId: text('routine_id')
		.notNull()
		.references(() => practiceRoutine.id),
	order: integer('order').notNull(),
	title: text('title').notNull(),
	type: text('type').notNull(), // warmup, scale, technique, song, cooldown, free
	durationSeconds: integer('duration_seconds').notNull(),
	instrumentId: text('instrument_id').references(() => instrument.id),
	settings: text('settings', { mode: 'json' }),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`)
});

// ─── Recordings ──────────────────────────────────────
export const recording = sqliteTable('recording', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	sessionId: text('session_id').references(() => practiceSession.id),
	fileUrl: text('file_url').notNull(),
	durationSeconds: integer('duration_seconds').notNull(),
	fileSize: integer('file_size').notNull(),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`)
});

// ─── Social Tables ────────────────────────────────────
export const follow = sqliteTable('follow', {
	id: text('id').primaryKey(),
	followerId: text('follower_id')
		.notNull()
		.references(() => user.id),
	followingId: text('following_id')
		.notNull()
		.references(() => user.id),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`)
});

export const feedPost = sqliteTable('feed_post', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	sessionId: text('session_id').references(() => practiceSession.id),
	content: text('content'),
	isPublic: integer('is_public', { mode: 'boolean' }).notNull().default(true),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`)
});

export const reaction = sqliteTable('reaction', {
	id: text('id').primaryKey(),
	postId: text('post_id')
		.notNull()
		.references(() => feedPost.id),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	type: text('type').notNull(), // like, cheer, fire, etc.
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`)
});

// ─── Practice Room Tables ──────────────────────────────
export const practiceRoom = sqliteTable('practice_room', {
	id: text('id').primaryKey(),
	hostId: text('host_id')
		.notNull()
		.references(() => user.id),
	name: text('name').notNull(),
	description: text('description'),
	maxParticipants: integer('max_participants').notNull().default(4),
	currentBpm: integer('current_bpm').notNull().default(120),
	timeSignature: text('time_signature').notNull().default('4/4'),
	isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
	inviteCode: text('invite_code').notNull().unique(),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`)
});

export const roomParticipant = sqliteTable('room_participant', {
	id: text('id').primaryKey(),
	roomId: text('room_id')
		.notNull()
		.references(() => practiceRoom.id),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	joinedAt: integer('joined_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`)
});

// ─── Type exports ────────────────────────────────────
export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;
export type Session = typeof session.$inferSelect;
export type Instrument = typeof instrument.$inferSelect;
export type NewInstrument = typeof instrument.$inferInsert;
export type PracticeSession = typeof practiceSession.$inferSelect;
export type NewPracticeSession = typeof practiceSession.$inferInsert;
export type PracticeTag = typeof practiceTag.$inferSelect;
export type AiGeneratedSheet = typeof aiGeneratedSheet.$inferSelect;
export type NewAiGeneratedSheet = typeof aiGeneratedSheet.$inferInsert;
export type AiAnalysis = typeof aiAnalysis.$inferSelect;
export type NewAiAnalysis = typeof aiAnalysis.$inferInsert;
export type Achievement = typeof achievement.$inferSelect;
export type NewAchievement = typeof achievement.$inferInsert;
export type UserAchievement = typeof userAchievement.$inferSelect;
export type NewUserAchievement = typeof userAchievement.$inferInsert;
export type SheetMusic = typeof sheetMusic.$inferSelect;
export type NewSheetMusic = typeof sheetMusic.$inferInsert;
export type PracticeGoal = typeof practiceGoal.$inferSelect;
export type NewPracticeGoal = typeof practiceGoal.$inferInsert;
export type PracticeRoutine = typeof practiceRoutine.$inferSelect;
export type NewPracticeRoutine = typeof practiceRoutine.$inferInsert;
export type RoutineItem = typeof routineItem.$inferSelect;
export type NewRoutineItem = typeof routineItem.$inferInsert;
export type Recording = typeof recording.$inferSelect;
export type NewRecording = typeof recording.$inferInsert;
export type Follow = typeof follow.$inferSelect;
export type NewFollow = typeof follow.$inferInsert;
export type FeedPost = typeof feedPost.$inferSelect;
export type NewFeedPost = typeof feedPost.$inferInsert;
export type Reaction = typeof reaction.$inferSelect;
export type NewReaction = typeof reaction.$inferInsert;
export type PracticeRoom = typeof practiceRoom.$inferSelect;
export type NewPracticeRoom = typeof practiceRoom.$inferInsert;
export type RoomParticipant = typeof roomParticipant.$inferSelect;
export type NewRoomParticipant = typeof roomParticipant.$inferInsert;
