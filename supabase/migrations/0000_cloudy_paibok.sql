CREATE TABLE "causes_of_death" (
	"id" serial PRIMARY KEY NOT NULL,
	"label" varchar(100) NOT NULL,
	"emoji" varchar(10),
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "flowers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"visitor_hash" varchar(64) NOT NULL,
	"flower_type" varchar(20) DEFAULT 'flower' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"slug" varchar(100) NOT NULL,
	"name" varchar(100) NOT NULL,
	"start_date" varchar(7) NOT NULL,
	"end_date" varchar(7) NOT NULL,
	"status" varchar(20) DEFAULT 'dead' NOT NULL,
	"cause_of_death" varchar(100) NOT NULL,
	"epitaph" varchar(140) NOT NULL,
	"description" text,
	"lessons_learned" text,
	"website_url" text,
	"repo_url" text,
	"tech_stack" text[],
	"flowers_count" integer DEFAULT 0 NOT NULL,
	"position_x" real,
	"position_y" real,
	"og_image_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" varchar(20) NOT NULL,
	"display_name" varchar(100),
	"avatar_url" text,
	"bio" varchar(280),
	"github_username" varchar(39),
	"projects_count" integer DEFAULT 0 NOT NULL,
	"flowers_received" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "flowers" ADD CONSTRAINT "flowers_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_flowers_unique" ON "flowers" USING btree ("project_id","visitor_hash");--> statement-breakpoint
CREATE INDEX "idx_flowers_project" ON "flowers" USING btree ("project_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_projects_user_slug" ON "projects" USING btree ("user_id","slug");--> statement-breakpoint
CREATE INDEX "idx_projects_user" ON "projects" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_projects_flowers" ON "projects" USING btree ("flowers_count");--> statement-breakpoint
CREATE INDEX "idx_projects_created" ON "projects" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_users_username" ON "users" USING btree ("username");