-- Phase 2: Resurrection enhancements

-- 1. resurrections_count on users (necromancer leaderboard)
ALTER TABLE "users" ADD COLUMN "resurrections_count" integer DEFAULT 0 NOT NULL;

-- 2. adopted_at on projects (for 30-day timeout tracking)
ALTER TABLE "projects" ADD COLUMN "adopted_at" timestamp with time zone;

-- 3. Drop partial unique index to allow multiple pledges per project
DROP INDEX IF EXISTS "idx_pledges_pending_unique";

-- 4. Notifications table (ghost ping + future use)
CREATE TABLE "notifications" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "type" varchar(50) NOT NULL,
  "message" text NOT NULL,
  "project_id" uuid REFERENCES "projects"("id") ON DELETE CASCADE,
  "read" boolean DEFAULT false NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX "idx_notifications_user" ON "notifications" ("user_id");
CREATE INDEX "idx_notifications_unread" ON "notifications" ("user_id") WHERE "read" = false;
