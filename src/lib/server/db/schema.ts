import { pgTable, serial, integer, text, timestamp, index, uniqueIndex } from 'drizzle-orm/pg-core';
import { user } from './auth.schema';

export const task = pgTable('task', {
	id: serial('id').primaryKey(),
	title: text('title').notNull(),
	priority: integer('priority').notNull().default(1)
});

export const flashcard = pgTable(
	'flashcard',
	{
		id: serial('id').primaryKey(),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		english: text('english').notNull(),
		teluguScript: text('telugu_script').notNull(),
		teluguRoman: text('telugu_roman').notNull(),
		sourceLang: text('source_lang').notNull(),
		sourceInput: text('source_input').notNull(),
		createdAt: timestamp('created_at').defaultNow().notNull()
	},
	(table) => [index('flashcard_userId_idx').on(table.userId)]
);

export const ttsCache = pgTable(
	'tts_cache',
	{
		id: serial('id').primaryKey(),
		teluguScript: text('telugu_script').notNull(),
		audioBase64: text('audio_base64').notNull(),
		createdAt: timestamp('created_at').defaultNow().notNull()
	},
	(table) => [uniqueIndex('tts_cache_script_idx').on(table.teluguScript)]
);

export * from './auth.schema';
