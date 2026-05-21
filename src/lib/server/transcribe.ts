import { openai } from './openai';
import type { SourceLang } from './translate';

// Bias the transcription decoder toward Telugu and English vocabulary so
// short utterances aren't auto-detected as Hindi/Tamil/etc. The OpenAI
// `language` param only accepts a single ISO code, so we rely on the
// `prompt` field for a soft two-language constraint. This is not a hard
// guarantee — if reliability becomes an issue, swap to a Telugu/English
// toggle in the UI and pass `language` directly.
const TELUGU_ENGLISH_PROMPT = [
	'The speaker is using a Telugu-English flashcard learning app.',
	'They are saying a single vocabulary word or short phrase in either Telugu or English — no other languages.',
	'Common Telugu examples: namaste, manchidi, ela unnaru, thinnava, neeru, annam, chinna, pedda, ammā, nānna.',
	'Common English examples: hello, water, food, mother, father, big, small, good, how are you, thank you.',
	'Transcribe exactly what was said.'
].join(' ');

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
		language: sourceLang,
		prompt: TELUGU_ENGLISH_PROMPT
	});

	return transcription.text.trim();
}
