-- Resurrection / Adopt feature: new columns + tables

-- New columns on projects
ALTER TABLE "projects" ADD COLUMN "open_for_resurrection" boolean DEFAULT false NOT NULL;
ALTER TABLE "projects" ADD COLUMN "resurrection_wishes_count" integer DEFAULT 0 NOT NULL;
ALTER TABLE "projects" ADD COLUMN "necromancer_id" uuid REFERENCES "users"("id") ON DELETE SET NULL;
ALTER TABLE "projects" ADD COLUMN "resurrection_proof_url" text;
ALTER TABLE "projects" ADD COLUMN "resurrected_at" timestamp with time zone;

CREATE INDEX "idx_projects_open_resurrection" ON "projects" ("open_for_resurrection") WHERE "open_for_resurrection" = true;

-- Wishes table (parallel to flowers)
CREATE TABLE "resurrection_wishes" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "project_id" uuid NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE,
  "visitor_hash" varchar(64) NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE UNIQUE INDEX "idx_wishes_unique" ON "resurrection_wishes" ("project_id", "visitor_hash");
CREATE INDEX "idx_wishes_project" ON "resurrection_wishes" ("project_id");

-- Pledges table
CREATE TABLE "adoption_pledges" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "project_id" uuid NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "message" varchar(140) NOT NULL,
  "status" varchar(20) DEFAULT 'pending' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "resolved_at" timestamp with time zone
);
CREATE INDEX "idx_pledges_project" ON "adoption_pledges" ("project_id");
CREATE INDEX "idx_pledges_user" ON "adoption_pledges" ("user_id");
CREATE UNIQUE INDEX "idx_pledges_pending_unique" ON "adoption_pledges" ("project_id") WHERE "status" = 'pending';
