import { pgTable, serial, integer, text, timestamp } from 'drizzle-orm/pg-core';

export const task = pgTable('task', {
	id: serial('id').primaryKey(),
	title: text('title').notNull(),
	priority: integer('priority').notNull().default(1)
});

export const flashcard = pgTable('flashcard', {
	id: serial('id').primaryKey(),
	english: text('english').notNull(),
	teluguScript: text('telugu_script').notNull(),
	teluguRoman: text('telugu_roman').notNull(),
	sourceLang: text('source_lang').notNull(),
	sourceInput: text('source_input').notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull()
});

export * from './auth.schema';
