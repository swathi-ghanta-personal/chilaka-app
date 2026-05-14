import { openai } from './openai';
import type { SourceLang } from './translate';

export async function transcribeAudio({
	file,
	sourceLang
}: {
	file: File;
	sourceLang?: SourceLang;
}): Promise<string> {
	const transcription = await openai.audio.transcriptions.create({
		model: 'gpt-4o-transcribe',
		file,
		language: sourceLang
	});

	return transcription.text.trim();
}
