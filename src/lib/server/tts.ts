import { eq } from 'drizzle-orm';
import { db } from './db';
import { ttsCache } from './db/schema';
import { openai } from './openai';

export async function synthesizeTelugu(teluguScript: string): Promise<ArrayBuffer> {
	const [cached] = await db
		.select({ audioBase64: ttsCache.audioBase64 })
		.from(ttsCache)
		.where(eq(ttsCache.teluguScript, teluguScript))
		.limit(1);

	if (cached) {
		const buf = Buffer.from(cached.audioBase64, 'base64');
		return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
	}

	const response = await openai.audio.speech.create({
		model: 'gpt-4o-mini-tts',
		voice: 'alloy',
		input: teluguScript,
		instructions: 'Speak this Telugu word or phrase clearly and slowly for a language learner.',
		response_format: 'mp3'
	});

	const arrayBuffer = await response.arrayBuffer();

	const audioBase64 = Buffer.from(arrayBuffer).toString('base64');
	await db.insert(ttsCache).values({ teluguScript, audioBase64 }).onConflictDoNothing();

	return arrayBuffer;
}
