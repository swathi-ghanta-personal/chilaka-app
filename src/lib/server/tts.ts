import { openai } from './openai';

export async function synthesizeTelugu(teluguScript: string): Promise<ArrayBuffer> {
	const response = await openai.audio.speech.create({
		model: 'gpt-4o-mini-tts',
		voice: 'alloy',
		input: teluguScript,
		instructions: 'Speak this Telugu word or phrase clearly and slowly for a language learner.',
		response_format: 'mp3'
	});

	return await response.arrayBuffer();
}
