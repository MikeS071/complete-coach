-- Training persistence foundation for Ticket 014A.

CREATE TYPE "library_scope" AS ENUM ('global', 'private');
CREATE TYPE "exercise_difficulty" AS ENUM ('beginner', 'intermediate', 'advanced');
CREATE TYPE "training_program_template_status" AS ENUM ('draft', 'published', 'archived');
CREATE TYPE "training_program_assignment_status" AS ENUM ('active', 'paused', 'completed', 'cancelled');

CREATE TABLE "exercise_library_items" (
  "id" TEXT NOT NULL,
  "organization_id" TEXT,
  "scope" "library_scope" NOT NULL,
  "name" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "equipment" TEXT,
  "primary_muscles" JSONB NOT NULL,
  "secondary_muscles" JSONB,
  "difficulty" "exercise_difficulty" NOT NULL DEFAULT 'intermediate',
  "video_object_id" TEXT,
  "image_object_id" TEXT,
  "default_sets" INTEGER,
  "default_reps" TEXT,
  "default_rest_seconds" INTEGER,
  "default_rpe" DECIMAL(4,2),
  "execution_cues" JSONB,
  "created_by_user_id" TEXT,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  "deleted_at" TIMESTAMPTZ(6),
  CONSTRAINT "exercise_library_items_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "exercise_scope_organization_consistency" CHECK (
    ("scope" = 'global' AND "organization_id" IS NULL) OR
    ("scope" = 'private' AND "organization_id" IS NOT NULL)
  )
);

CREATE TABLE "training_program_templates" (
  "id" TEXT NOT NULL,
  "organization_id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "goal" TEXT,
  "duration_weeks" INTEGER NOT NULL,
  "status" "training_program_template_status" NOT NULL DEFAULT 'draft',
  "template_json" JSONB NOT NULL,
  "created_by_user_id" TEXT,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  "deleted_at" TIMESTAMPTZ(6),
  CONSTRAINT "training_program_templates_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "training_program_assignments" (
  "id" TEXT NOT NULL,
  "organization_id" TEXT NOT NULL,
  "client_id" TEXT NOT NULL,
  "template_id" TEXT,
  "name" TEXT NOT NULL,
  "status" "training_program_assignment_status" NOT NULL DEFAULT 'active',
  "starts_on" DATE NOT NULL,
  "ends_on" DATE,
  "snapshot_json" JSONB NOT NULL,
  "created_by_user_id" TEXT,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "training_program_assignments_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "exercise_library_items_scope_idx" ON "exercise_library_items" ("scope");
CREATE INDEX "exercise_library_items_organization_id_name_idx" ON "exercise_library_items" ("organization_id", "name");
CREATE INDEX "exercise_library_items_organization_id_category_idx" ON "exercise_library_items" ("organization_id", "category");
CREATE INDEX "exercise_library_items_created_by_user_id_idx" ON "exercise_library_items" ("created_by_user_id");
CREATE INDEX "exercise_library_items_primary_muscles_gin_idx" ON "exercise_library_items" USING GIN ("primary_muscles");

CREATE INDEX "training_program_templates_organization_id_status_idx" ON "training_program_templates" ("organization_id", "status");
CREATE INDEX "training_program_templates_organization_id_name_idx" ON "training_program_templates" ("organization_id", "name");
CREATE INDEX "training_program_templates_created_by_user_id_idx" ON "training_program_templates" ("created_by_user_id");

CREATE INDEX "training_program_assignments_organization_id_client_id_status_idx" ON "training_program_assignments" ("organization_id", "client_id", "status");
CREATE INDEX "training_program_assignments_organization_id_template_id_idx" ON "training_program_assignments" ("organization_id", "template_id");
CREATE INDEX "training_program_assignments_created_by_user_id_idx" ON "training_program_assignments" ("created_by_user_id");

ALTER TABLE "exercise_library_items" ADD CONSTRAINT "exercise_library_items_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "exercise_library_items" ADD CONSTRAINT "exercise_library_items_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "training_program_templates" ADD CONSTRAINT "training_program_templates_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "training_program_templates" ADD CONSTRAINT "training_program_templates_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "training_program_assignments" ADD CONSTRAINT "training_program_assignments_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "training_program_assignments" ADD CONSTRAINT "training_program_assignments_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "training_program_assignments" ADD CONSTRAINT "training_program_assignments_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "training_program_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "training_program_assignments" ADD CONSTRAINT "training_program_assignments_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
