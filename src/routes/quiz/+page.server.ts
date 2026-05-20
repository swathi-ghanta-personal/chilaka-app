import { asc, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { flashcard } from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) return { cards: [] };

	const cards = await db
		.select()
		.from(flashcard)
		.where(eq(flashcard.userId, locals.user.id))
		.orderBy(asc(flashcard.createdAt))
		.limit(10);

	return { cards };
};
