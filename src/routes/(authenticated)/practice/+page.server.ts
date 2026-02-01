import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { generateId } from '$lib/server/auth-utils';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const instruments = await db
		.select()
		.from(table.instrument)
		.where(eq(table.instrument.userId, locals.user!.id));
	return { instruments };
};

export const actions: Actions = {
	start: async ({ request, locals }) => {
		const formData = await request.formData();
		const instrumentId = formData.get('instrumentId') as string;
		const contentType = (formData.get('contentType') as string) || 'free';
		const bpm = Number(formData.get('bpm')) || 120;
		const notationMode = (formData.get('notationMode') as string) || 'tab';
		const timeSignature = (formData.get('timeSignature') as string) || '4/4';
		const aiSheetId = formData.get('aiSheetId') as string | null;

		if (!instrumentId) {
			return fail(400, { error: '악기를 선택해주세요' });
		}

		const sessionId = generateId();

		// If AI sheet is selected, load its data
		let contentTitle = null;
		let contentSource = 'custom';
		if (aiSheetId && (contentType === 'ai_generated' || contentType === 'scale')) {
			const [aiSheet] = await db
				.select()
				.from(table.aiGeneratedSheet)
				.where(
					and(
						eq(table.aiGeneratedSheet.id, aiSheetId),
						eq(table.aiGeneratedSheet.userId, locals.user!.id)
					)
				)
				.limit(1);

			if (aiSheet) {
				contentTitle = aiSheet.title;
				contentSource = contentType === 'scale' ? 'ai_recommended' : 'ai_generated';
				// Update timesPracticed
				await db
					.update(table.aiGeneratedSheet)
					.set({ timesPracticed: aiSheet.timesPracticed + 1 })
					.where(eq(table.aiGeneratedSheet.id, aiSheetId));
			}
		}

		await db.insert(table.practiceSession).values({
			id: sessionId,
			userId: locals.user!.id,
			instrumentId,
			startedAt: new Date(),
			durationSeconds: 0,
			contentType,
			contentTitle: contentTitle || null,
			contentSource,
			aiSheetId: aiSheetId || null,
			initialBpm: bpm,
			finalBpm: bpm,
			timeSignature,
			notationMode,
			sessionData: {
				metronome: { initial_bpm: bpm, bpm_changes: [], time_signature: timeSignature },
				playback: { play_count: 0, pause_count: 0, total_pause_seconds: 0, loop_sections: [] },
				notation_switches: []
			}
		});

		redirect(303, `/practice/${sessionId}`);
	}
};
