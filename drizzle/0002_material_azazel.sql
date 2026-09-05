CREATE TABLE "github_connections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"github_user_id" bigint NOT NULL,
	"github_login" varchar(255) NOT NULL,
	"github_name" varchar(255),
	"github_avatar_url" text,
	"encrypted_access_token" text NOT NULL,
	"scopes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "github_commit_imports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"repository_id" bigint NOT NULL,
	"sha" varchar(64) NOT NULL,
	"message" text NOT NULL,
	"html_url" text NOT NULL,
	"author_login" varchar(255),
	"author_name" varchar(255),
	"committed_at" timestamp with time zone NOT NULL,
	"imported_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "github_repository_id" bigint;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "github_repository_owner" varchar(255);--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "github_repository_name" varchar(255);--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "github_repository_url" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "github_default_branch" varchar(255);--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "github_last_synced_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "github_commit_imports" ADD CONSTRAINT "github_commit_imports_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "github_connections_user_id_unique" ON "github_connections" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "github_commit_imports_project_sha_unique" ON "github_commit_imports" USING btree ("project_id","sha");--> statement-breakpoint
CREATE INDEX "github_commit_imports_project_committed_at_idx" ON "github_commit_imports" USING btree ("project_id","committed_at");--> statement-breakpoint
CREATE INDEX "projects_user_github_repository_idx" ON "projects" USING btree ("user_id","github_repository_id");