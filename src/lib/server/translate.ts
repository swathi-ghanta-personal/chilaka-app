import { openai } from './openai';

export type SourceLang = 'te' | 'en';

export interface TranslatedCard {
	english: string;
	teluguScript: string;
	teluguRoman: string;
	sourceLang: SourceLang;
}

const SYSTEM_PROMPT = `You are a Telugu/English vocabulary helper for an English-speaking learner.

Given a single word or short phrase in Telugu (either Telugu script or a casual Roman transliteration) OR in English, return all of the following:
- english: the natural English equivalent (lowercase unless it is a proper noun)
- teluguScript: the equivalent written in Telugu script (use proper Telugu characters, never Roman letters)
- teluguRoman: a casual Roman transliteration of the Telugu word as an English speaker would write it texting a friend (e.g. "manchidi", "ela unnaru", "thinnava"). Do NOT use IAST diacritics or scholarly notation.
- sourceLang: "te" if the input was Telugu (in either script), "en" if the input was English.

Always return all four fields. If the input is ambiguous, pick the most common everyday meaning.`;

const RESPONSE_SCHEMA = {
	type: 'object',
	additionalProperties: false,
	properties: {
		english: { type: 'string' },
		teluguScript: { type: 'string' },
		teluguRoman: { type: 'string' },
		sourceLang: { type: 'string', enum: ['te', 'en'] }
	},
	required: ['english', 'teluguScript', 'teluguRoman', 'sourceLang']
} as const;

export async function translateWord({
	text,
	sourceLang
}: {
	text: string;
	sourceLang?: SourceLang;
}): Promise<TranslatedCard> {
	const hint = sourceLang
		? `\n\nThe user has indicated the source language is ${sourceLang === 'te' ? 'Telugu' : 'English'}.`
		: '';

	const response = await openai.chat.completions.create({
		model: 'gpt-4o',
		messages: [
			{ role: 'system', content: SYSTEM_PROMPT + hint },
			{ role: 'user', content: text }
		],
		response_format: {
			type: 'json_schema',
			json_schema: {
				name: 'translated_card',
				strict: true,
				schema: RESPONSE_SCHEMA
			}
		}
	});

	const content = response.choices[0]?.message?.content;
	if (!content) {
		throw new Error('OpenAI returned an empty translation response');
	}

	const parsed = JSON.parse(content) as TranslatedCard;
	return parsed;
}
