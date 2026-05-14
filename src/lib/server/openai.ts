import OpenAI from 'openai';
import { env } from '$env/dynamic/private';

if (!env.OPENAI_API_KEY) {
	throw new Error('OPENAI_API_KEY is not set');
}

export const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });
