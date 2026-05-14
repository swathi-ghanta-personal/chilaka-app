import { error, isHttpError } from '@sveltejs/kit';
import { synthesizeTelugu } from '$lib/server/tts';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = (await request.json()) as { teluguScript?: unknown };

		if (!body.teluguScript || typeof body.teluguScript !== 'string') {
			error(400, 'teluguScript is required');
		}

		const audio = await synthesizeTelugu(body.teluguScript);

		return new Response(audio, {
			headers: {
				'Content-Type': 'audio/mpeg',
				'Cache-Control': 'public, max-age=3600'
			}
		});
	} catch (err) {
		if (isHttpError(err)) throw err;
		console.error('[api/tts]', err);
		const message = err instanceof Error ? err.message : 'TTS failed';
		error(500, message);
	}
};
