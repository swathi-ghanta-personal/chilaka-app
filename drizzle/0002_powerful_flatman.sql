DELETE FROM "flashcard";
--> statement-breakpoint
ALTER TABLE "flashcard" ADD COLUMN "user_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "flashcard" ADD CONSTRAINT "flashcard_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "flashcard_userId_idx" ON "flashcard" USING btree ("user_id");