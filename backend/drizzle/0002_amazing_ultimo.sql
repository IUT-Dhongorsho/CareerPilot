ALTER TYPE "public"."kanban_status" ADD VALUE 'wishlist' BEFORE 'applied';--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "metadata" jsonb;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "has_uploaded_cv" boolean DEFAULT false NOT NULL;
