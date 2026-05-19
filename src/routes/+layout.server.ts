import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	const user = locals.user ?? null;
	return {
		user,
		session: locals.session ?? null,
		isAnonymous: user?.isAnonymous === true
	};
};
