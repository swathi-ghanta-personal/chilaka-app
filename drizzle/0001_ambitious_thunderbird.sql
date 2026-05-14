CREATE TABLE "flashcard" (
	"id" serial PRIMARY KEY NOT NULL,
	"english" text NOT NULL,
	"telugu_script" text NOT NULL,
	"telugu_roman" text NOT NULL,
	"source_lang" text NOT NULL,
	"source_input" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
