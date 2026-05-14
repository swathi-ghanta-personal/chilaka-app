import { fail } from '@sveltejs/kit';
import { desc } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { flashcard } from '$lib/server/db/schema';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const cards = await db.select().from(flashcard).orderBy(desc(flashcard.createdAt));
	return { cards };
};

export const actions: Actions = {
	save: async ({ request }) => {
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
			english,
			teluguScript,
			teluguRoman,
			sourceLang,
			sourceInput: sourceInput || english
		});

		return { saved: true };
	}
};
