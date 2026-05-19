import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { flashcard } from '$lib/server/db/schema';

/** Move flashcards from an anonymous user to the account they signed into. */
export async function transferFlashcardsToUser(
	fromUserId: string,
	toUserId: string
): Promise<void> {
	if (fromUserId === toUserId) return;

	await db
		.update(flashcard)
		.set({ userId: toUserId })
		.where(eq(flashcard.userId, fromUserId));
}
