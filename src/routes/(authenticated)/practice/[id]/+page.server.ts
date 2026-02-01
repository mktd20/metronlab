import { error, fail } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import * as achievements from '$lib/server/achievements';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const [session] = await db
		.select({
			session: table.practiceSession,
			instrument: table.instrument
		})
		.from(table.practiceSession)
		.leftJoin(table.instrument, eq(table.practiceSession.instrumentId, table.instrument.id))
		.where(
			and(
				eq(table.practiceSession.id, params.id),
				eq(table.practiceSession.userId, locals.user!.id)
			)
		);

	if (!session) {
		error(404, '세션을 찾을 수 없습니다');
	}

	// Load AI sheet if exists
	let aiSheet = null;
	if (session.session.aiSheetId) {
		const [sheet] = await db
			.select()
			.from(table.aiGeneratedSheet)
			.where(
				and(
					eq(table.aiGeneratedSheet.id, session.session.aiSheetId),
					eq(table.aiGeneratedSheet.userId, locals.user!.id)
				)
			)
			.limit(1);
		aiSheet = sheet || null;
	}

	return {
		practiceSession: session.session,
		instrument: session.instrument,
		aiSheet
	};
};

export const actions: Actions = {
	end: async ({ params, request, locals }) => {
		const formData = await request.formData();
		const durationSeconds = Number(formData.get('durationSeconds')) || 0;
		const finalBpm = Number(formData.get('finalBpm')) || 120;
		const sessionDataStr = formData.get('sessionData') as string;

		// 1분 미만 연습은 기록으로 저장하지 않음
		if (durationSeconds < 60) {
			// 세션 삭제
			await db
				.delete(table.practiceSession)
				.where(
					and(
						eq(table.practiceSession.id, params.id),
						eq(table.practiceSession.userId, locals.user!.id)
					)
				);
			return fail(400, {
				error: '연습 시간이 너무 짧습니다. 최소 1분 이상 연습해주세요.',
				durationTooShort: true
			});
		}

		await db
			.update(table.practiceSession)
			.set({
				endedAt: new Date(),
				durationSeconds,
				finalBpm,
				sessionData: sessionDataStr ? JSON.parse(sessionDataStr) : undefined,
				updatedAt: new Date()
			})
			.where(
				and(
					eq(table.practiceSession.id, params.id),
					eq(table.practiceSession.userId, locals.user!.id)
				)
			);

		// Check achievements (async, don't wait)
		achievements.checkAchievements(locals.user!.id).catch(console.error);

		return { ended: true };
	},

	comment: async ({ params, request, locals }) => {
		const formData = await request.formData();
		const comment = (formData.get('comment') as string)?.trim() || null;
		const quickTagsStr = formData.get('quickTags') as string;
		const satisfactionRating = Number(formData.get('satisfactionRating')) || null;

		await db
			.update(table.practiceSession)
			.set({
				userComment: comment,
				quickTags: quickTagsStr ? JSON.parse(quickTagsStr) : null,
				satisfactionRating,
				commentSubmittedAt: new Date(),
				updatedAt: new Date()
			})
			.where(
				and(
					eq(table.practiceSession.id, params.id),
					eq(table.practiceSession.userId, locals.user!.id)
				)
			);

		// Trigger AI analysis if comment exists (async, don't wait)
		if (comment) {
			// Analysis will be triggered when user requests it via API
			// or can be done automatically here if needed
		}

		// Check achievements
		achievements.checkAchievements(locals.user!.id).catch(console.error);

		return { commented: true };
	}
};
