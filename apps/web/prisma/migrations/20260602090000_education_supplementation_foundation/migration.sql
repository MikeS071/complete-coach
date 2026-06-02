-- Education and supplementation persistence foundation for Ticket 018A.

CREATE TYPE "supplement_plan_template_status" AS ENUM ('draft', 'published', 'archived');
CREATE TYPE "supplement_plan_assignment_status" AS ENUM ('active', 'paused', 'completed', 'cancelled');
CREATE TYPE "education_resource_type" AS ENUM ('article', 'video', 'pdf', 'link', 'file');
CREATE TYPE "education_resource_visibility" AS ENUM ('private', 'assigned');
CREATE TYPE "education_resource_assignment_status" AS ENUM ('assigned', 'viewed', 'completed', 'cancelled');

CREATE TABLE "supplement_library_items" (
  "id" TEXT NOT NULL,
  "organization_id" TEXT,
  "scope" "library_scope" NOT NULL,
  "name" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "recommended_timing" TEXT,
  "dosage" TEXT,
  "bioavailability_notes" TEXT,
  "clinical_description" TEXT,
  "tags" JSONB,
  "image_object_id" TEXT,
  "created_by_user_id" TEXT,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  "deleted_at" TIMESTAMPTZ(6),
  CONSTRAINT "supplement_library_items_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "supplement_plan_templates" (
  "id" TEXT NOT NULL,
  "organization_id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "status" "supplement_plan_template_status" NOT NULL DEFAULT 'draft',
  "template_json" JSONB NOT NULL,
  "created_by_user_id" TEXT,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  "deleted_at" TIMESTAMPTZ(6),
  CONSTRAINT "supplement_plan_templates_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "supplement_plan_assignments" (
  "id" TEXT NOT NULL,
  "organization_id" TEXT NOT NULL,
  "client_id" TEXT NOT NULL,
  "template_id" TEXT,
  "name" TEXT NOT NULL,
  "status" "supplement_plan_assignment_status" NOT NULL DEFAULT 'active',
  "snapshot_json" JSONB NOT NULL,
  "starts_on" DATE NOT NULL,
  "ends_on" DATE,
  "created_by_user_id" TEXT,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "supplement_plan_assignments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "education_resources" (
  "id" TEXT NOT NULL,
  "organization_id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "category" TEXT NOT NULL,
  "resource_type" "education_resource_type" NOT NULL,
  "object_id" TEXT,
  "external_url" TEXT,
  "tags" JSONB,
  "visibility" "education_resource_visibility" NOT NULL DEFAULT 'private',
  "created_by_user_id" TEXT,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  "deleted_at" TIMESTAMPTZ(6),
  CONSTRAINT "education_resources_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "education_resource_assignments" (
  "id" TEXT NOT NULL,
  "organization_id" TEXT NOT NULL,
  "resource_id" TEXT NOT NULL,
  "client_id" TEXT NOT NULL,
  "assigned_by_user_id" TEXT,
  "status" "education_resource_assignment_status" NOT NULL DEFAULT 'assigned',
  "assigned_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completed_at" TIMESTAMPTZ(6),
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "education_resource_assignments_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "supplement_library_items_scope_idx" ON "supplement_library_items" ("scope");
CREATE INDEX "supplement_library_items_organization_id_name_idx" ON "supplement_library_items" ("organization_id", "name");
CREATE INDEX "supplement_library_items_organization_id_category_idx" ON "supplement_library_items" ("organization_id", "category");
CREATE INDEX "supplement_library_items_created_by_user_id_idx" ON "supplement_library_items" ("created_by_user_id");

CREATE INDEX "supplement_plan_templates_organization_id_status_idx" ON "supplement_plan_templates" ("organization_id", "status");
CREATE INDEX "supplement_plan_templates_organization_id_name_idx" ON "supplement_plan_templates" ("organization_id", "name");
CREATE INDEX "supplement_plan_templates_created_by_user_id_idx" ON "supplement_plan_templates" ("created_by_user_id");

CREATE INDEX "supplement_plan_assignments_organization_id_client_id_status_idx" ON "supplement_plan_assignments" ("organization_id", "client_id", "status");
CREATE INDEX "supplement_plan_assignments_organization_id_template_id_idx" ON "supplement_plan_assignments" ("organization_id", "template_id");
CREATE INDEX "supplement_plan_assignments_created_by_user_id_idx" ON "supplement_plan_assignments" ("created_by_user_id");

CREATE INDEX "education_resources_organization_id_category_idx" ON "education_resources" ("organization_id", "category");
CREATE INDEX "education_resources_organization_id_visibility_idx" ON "education_resources" ("organization_id", "visibility");
CREATE INDEX "education_resources_organization_id_resource_type_idx" ON "education_resources" ("organization_id", "resource_type");
CREATE INDEX "education_resources_created_by_user_id_idx" ON "education_resources" ("created_by_user_id");

CREATE UNIQUE INDEX "education_resource_assignments_resource_id_client_id_key" ON "education_resource_assignments" ("resource_id", "client_id");
CREATE INDEX "education_resource_assignments_organization_id_client_id_status_idx" ON "education_resource_assignments" ("organization_id", "client_id", "status");
CREATE INDEX "education_resource_assignments_organization_id_resource_id_idx" ON "education_resource_assignments" ("organization_id", "resource_id");
CREATE INDEX "education_resource_assignments_assigned_by_user_id_idx" ON "education_resource_assignments" ("assigned_by_user_id");

ALTER TABLE "supplement_library_items" ADD CONSTRAINT "supplement_library_items_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "supplement_library_items" ADD CONSTRAINT "supplement_library_items_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "supplement_plan_templates" ADD CONSTRAINT "supplement_plan_templates_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "supplement_plan_templates" ADD CONSTRAINT "supplement_plan_templates_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "supplement_plan_assignments" ADD CONSTRAINT "supplement_plan_assignments_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "supplement_plan_assignments" ADD CONSTRAINT "supplement_plan_assignments_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "supplement_plan_assignments" ADD CONSTRAINT "supplement_plan_assignments_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "supplement_plan_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "supplement_plan_assignments" ADD CONSTRAINT "supplement_plan_assignments_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "education_resources" ADD CONSTRAINT "education_resources_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "education_resources" ADD CONSTRAINT "education_resources_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "education_resource_assignments" ADD CONSTRAINT "education_resource_assignments_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "education_resource_assignments" ADD CONSTRAINT "education_resource_assignments_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "education_resources"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "education_resource_assignments" ADD CONSTRAINT "education_resource_assignments_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "education_resource_assignments" ADD CONSTRAINT "education_resource_assignments_assigned_by_user_id_fkey" FOREIGN KEY ("assigned_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
