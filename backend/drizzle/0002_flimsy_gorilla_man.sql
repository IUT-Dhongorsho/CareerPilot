ALTER TABLE "messages" ADD COLUMN "metadata" jsonb;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "has_uploaded_cv" boolean DEFAULT false NOT NULL;