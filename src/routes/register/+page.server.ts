import { fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import * as auth from '$lib/server/auth';
import { generateId, hashPassword, registerSchema } from '$lib/server/auth-utils';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) {
		redirect(302, '/dashboard');
	}
};

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const formData = await request.formData();
		const data = {
			email: formData.get('email') as string,
			password: formData.get('password') as string,
			displayName: formData.get('displayName') as string
		};

		const result = registerSchema.safeParse(data);
		if (!result.success) {
			const errors = result.error.flatten().fieldErrors;
			return fail(400, { error: Object.values(errors).flat()[0], email: data.email, displayName: data.displayName });
		}

		const existing = await db.select().from(table.user).where(eq(table.user.email, data.email));
		if (existing.length > 0) {
			return fail(400, { error: '이미 사용 중인 이메일입니다', email: data.email, displayName: data.displayName });
		}

		const userId = generateId();
		const hashedPassword = await hashPassword(data.password);

		await db.insert(table.user).values({
			id: userId,
			email: data.email,
			hashedPassword,
			displayName: data.displayName
		});

		const token = auth.generateSessionToken();
		const session = await auth.createSession(token, userId);
		auth.setSessionTokenCookie({ cookies } as any, token, session.expiresAt);

		redirect(302, '/dashboard');
	}
};
