import { fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import * as auth from '$lib/server/auth';
import { loginSchema, verifyPassword } from '$lib/server/auth-utils';
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
			password: formData.get('password') as string
		};

		const result = loginSchema.safeParse(data);
		if (!result.success) {
			const errors = result.error.flatten().fieldErrors;
			return fail(400, { error: Object.values(errors).flat()[0], email: data.email });
		}

		const [existingUser] = await db
			.select()
			.from(table.user)
			.where(eq(table.user.email, data.email));

		if (!existingUser) {
			return fail(400, { error: '이메일 또는 비밀번호가 올바르지 않습니다', email: data.email });
		}

		const validPassword = await verifyPassword(existingUser.hashedPassword, data.password);
		if (!validPassword) {
			return fail(400, { error: '이메일 또는 비밀번호가 올바르지 않습니다', email: data.email });
		}

		const token = auth.generateSessionToken();
		const session = await auth.createSession(token, existingUser.id);
		auth.setSessionTokenCookie({ cookies } as any, token, session.expiresAt);

		redirect(302, '/dashboard');
	}
};
