CREATE TYPE "public"."interview_status" AS ENUM('started', 'completed', 'failed');--> statement-breakpoint
CREATE TABLE "interview_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"job_id" uuid NOT NULL,
	"vapi_call_id" text,
	"status" "interview_status" DEFAULT 'started' NOT NULL,
	"transcript" text,
	"summary" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "interview_sessions" ADD CONSTRAINT "interview_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interview_sessions" ADD CONSTRAINT "interview_sessions_job_id_kanban_items_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."kanban_items"("id") ON DELETE cascade ON UPDATE no action;