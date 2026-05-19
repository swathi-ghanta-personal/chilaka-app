import type { Handle, RequestEvent } from '@sveltejs/kit';
import { building } from '$app/environment';
import { auth } from '$lib/server/auth';
import { svelteKitHandler } from 'better-auth/svelte-kit';

/** Cookie header reconstructed from RequestEvent cookies (includes Set-Cookie from Better Auth middleware). */
function cookieHeader(event: RequestEvent): Headers {
	const h = new Headers(event.request.headers);
	const parts = event.cookies.getAll().map(({ name, value }) => `${name}=${value}`);
	if (parts.length > 0) h.set('cookie', parts.join('; '));
	return h;
}

const handleBetterAuth: Handle = async ({ event, resolve }) => {
	let session = await auth.api.getSession({ headers: event.request.headers });

	if (!session && !building) {
		await auth.api.signInAnonymous({ headers: event.request.headers });
		session = await auth.api.getSession({ headers: cookieHeader(event) });
	}

	if (session) {
		event.locals.session = session.session;
		event.locals.user = session.user;
	}

	return svelteKitHandler({ event, resolve, auth, building });
};

export const handle: Handle = handleBetterAuth;
