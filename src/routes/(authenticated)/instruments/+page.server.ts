import { fail } from '@sveltejs/kit';
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
	create: async ({ request, locals }) => {
		const formData = await request.formData();
		const type = (formData.get('type') as string)?.trim();
		const name = (formData.get('name') as string)?.trim();

		if (!type || !name) {
			return fail(400, { error: '악기 종류와 이름을 입력해주세요' });
		}

		await db.insert(table.instrument).values({
			id: generateId(),
			userId: locals.user!.id,
			type,
			name,
			isCustom: !['guitar', 'bass', 'drums', 'keyboard', 'piano', 'violin', 'ukulele', 'vocal'].includes(type)
		});

		return { success: true };
	},

	delete: async ({ request, locals }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;

		await db
			.delete(table.instrument)
			.where(and(eq(table.instrument.id, id), eq(table.instrument.userId, locals.user!.id)));

		return { success: true };
	}
};
