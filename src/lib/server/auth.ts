import { betterAuth } from 'better-auth/minimal';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { anonymous } from 'better-auth/plugins/anonymous';
import { env } from '$env/dynamic/private';
import { getRequestEvent } from '$app/server';
import { db } from '$lib/server/db';
import { transferFlashcardsToUser } from '$lib/server/transfer-flashcards';

export const auth = betterAuth({
	baseURL: env.ORIGIN,
	secret: env.BETTER_AUTH_SECRET,
	database: drizzleAdapter(db, { provider: 'pg' }),
	emailAndPassword: { enabled: true },
	plugins: [
		anonymous({
			onLinkAccount: async ({ anonymousUser, newUser }) => {
				await transferFlashcardsToUser(anonymousUser.user.id, newUser.user.id);
			}
		}),
		sveltekitCookies(getRequestEvent) // must be last — applies Set-Cookie to the current SvelteKit event
	]
});
