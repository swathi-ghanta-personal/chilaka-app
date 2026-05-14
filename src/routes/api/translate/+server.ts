import { error, isHttpError, json } from '@sveltejs/kit';
import { transcribeAudio } from '$lib/server/transcribe';
import { translateWord, type SourceLang } from '$lib/server/translate';
import type { RequestHandler } from './$types';

function parseSourceLang(value: unknown): SourceLang | undefined {
	return value === 'te' || value === 'en' ? value : undefined;
}

export const POST: RequestHandler = async ({ request }) => {
	const contentType = request.headers.get('content-type') ?? '';

	try {
		let text: string;
		let sourceLang: SourceLang | undefined;

		if (contentType.includes('multipart/form-data')) {
			const form = await request.formData();
			const audio = form.get('audio');
			sourceLang = parseSourceLang(form.get('sourceLang'));

			if (!(audio instanceof File)) {
				error(400, 'audio file is required');
			}

			text = await transcribeAudio({ file: audio, sourceLang });
			if (!text) {
				error(422, "Couldn't hear anything in that recording. Try again?");
			}
		} else {
			const body = (await request.json()) as { text?: string; sourceLang?: unknown };
			if (!body.text || typeof body.text !== 'string') {
				error(400, 'text is required');
			}
			text = body.text.trim();
			sourceLang = parseSourceLang(body.sourceLang);
		}

		const card = await translateWord({ text, sourceLang });

		return json({ ...card, sourceInput: text });
	} catch (err) {
		if (isHttpError(err)) throw err;
		console.error('[api/translate]', err);
		const message = err instanceof Error ? err.message : 'Translation failed';
		error(500, message);
	}
};
