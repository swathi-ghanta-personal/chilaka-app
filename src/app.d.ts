import type { Session, User } from 'better-auth/types';

type AppUser = User & { isAnonymous?: boolean | null };

// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		interface Locals {
			user?: AppUser;
			session?: Session;
		}

		// interface Error {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
