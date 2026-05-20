import { fail, redirect } from '@sveltejs/kit';
import { and, desc, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { flashcard } from '$lib/server/db/schema';
import { auth } from '$lib/server/auth';
import { APIError } from 'better-auth/api';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) return { cards: [] };

	const cards = await db
		.select()
		.from(flashcard)
		.where(eq(flashcard.userId, locals.user.id))
		.orderBy(desc(flashcard.createdAt));

	return { cards };
};

export const actions: Actions = {
	signInEmail: async (event) => {
		const formData = await event.request.formData();
		const email = formData.get('email')?.toString() ?? '';
		const password = formData.get('password')?.toString() ?? '';

		try {
			await auth.api.signInEmail({
				headers: event.request.headers,
				body: { email, password, callbackURL: '/' }
			});
		} catch (error) {
			if (error instanceof APIError) {
				return fail(400, { message: error.message || 'Sign in failed' });
			}
			return fail(500, { message: 'Unexpected error' });
		}

		throw redirect(302, '/');
	},
	signUpEmail: async (event) => {
		const formData = await event.request.formData();
		const email = formData.get('email')?.toString() ?? '';
		const password = formData.get('password')?.toString() ?? '';
		const name = formData.get('name')?.toString() ?? '';

		try {
			await auth.api.signUpEmail({
				headers: event.request.headers,
				body: {
					email,
					password,
					name: name || email.split('@')[0] || 'User',
					callbackURL: '/'
				}
			});
		} catch (error) {
			if (error instanceof APIError) {
				return fail(400, { message: error.message || 'Registration failed' });
			}
			return fail(500, { message: 'Unexpected error' });
		}

		throw redirect(302, '/');
	},
	signOut: async (event) => {
		await auth.api.signOut({ headers: event.request.headers });
		throw redirect(302, '/');
	},
	save: async ({ request, locals }) => {
		if (!locals.user) return fail(401, { error: 'Not authenticated' });

		const form = await request.formData();
		const english = String(form.get('english') ?? '').trim();
		const teluguScript = String(form.get('teluguScript') ?? '').trim();
		const teluguRoman = String(form.get('teluguRoman') ?? '').trim();
		const sourceLang = String(form.get('sourceLang') ?? '').trim();
		const sourceInput = String(form.get('sourceInput') ?? '').trim();

		if (!english || !teluguScript || !teluguRoman) {
			return fail(400, { error: 'Missing required fields' });
		}

		if (sourceLang !== 'te' && sourceLang !== 'en') {
			return fail(400, { error: 'Invalid sourceLang' });
		}

		await db.insert(flashcard).values({
			userId: locals.user.id,
			english,
			teluguScript,
			teluguRoman,
			sourceLang,
			sourceInput: sourceInput || english
		});

		return { saved: true };
	},
	delete: async ({ request, locals }) => {
		if (!locals.user) return fail(401, { error: 'Not authenticated' });

		const form = await request.formData();
		const id = Number(form.get('id'));

		if (!Number.isInteger(id) || id < 1) {
			return fail(400, { error: 'Invalid flashcard id' });
		}

		await db
			.delete(flashcard)
			.where(and(eq(flashcard.id, id), eq(flashcard.userId, locals.user.id)));

		return { deleted: true };
	}
};
