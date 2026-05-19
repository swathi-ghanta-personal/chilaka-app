CREATE TABLE "tts_cache" (
	"id" serial PRIMARY KEY NOT NULL,
	"telugu_script" text NOT NULL,
	"audio_base64" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "tts_cache_script_idx" ON "tts_cache" USING btree ("telugu_script");