import { hash, verify } from '@node-rs/argon2';
import { z } from 'zod';

export async function hashPassword(password: string): Promise<string> {
	return await hash(password, {
		memoryCost: 19456,
		timeCost: 2,
		outputLen: 32,
		parallelism: 1
	});
}

export async function verifyPassword(hash: string, password: string): Promise<boolean> {
	return await verify(hash, password);
}

export function generateId(): string {
	const bytes = crypto.getRandomValues(new Uint8Array(16));
	return Array.from(bytes)
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('');
}

// ─── Validation Schemas ──────────────────────────────

export const registerSchema = z.object({
	email: z.string().email('유효한 이메일을 입력해주세요'),
	password: z
		.string()
		.min(8, '비밀번호는 8자 이상이어야 합니다')
		.max(128, '비밀번호는 128자 이하여야 합니다'),
	displayName: z
		.string()
		.min(2, '이름은 2자 이상이어야 합니다')
		.max(50, '이름은 50자 이하여야 합니다')
});

export const loginSchema = z.object({
	email: z.string().email('유효한 이메일을 입력해주세요'),
	password: z.string().min(1, '비밀번호를 입력해주세요')
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
