-- Meal plan template and assignment persistence for Ticket 015B.

CREATE TYPE "meal_plan_template_status" AS ENUM ('draft', 'published', 'archived');
CREATE TYPE "meal_plan_assignment_status" AS ENUM ('active', 'paused', 'completed', 'cancelled');

CREATE TABLE "meal_plan_templates" (
  "id" TEXT NOT NULL,
  "organization_id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "phase" TEXT,
  "target_calories" INTEGER NOT NULL,
  "protein_g" DECIMAL(8,2) NOT NULL,
  "carbs_g" DECIMAL(8,2) NOT NULL,
  "fat_g" DECIMAL(8,2) NOT NULL,
  "status" "meal_plan_template_status" NOT NULL DEFAULT 'draft',
  "template_json" JSONB NOT NULL,
  "created_by_user_id" TEXT,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  "deleted_at" TIMESTAMPTZ(6),
  CONSTRAINT "meal_plan_templates_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "meal_plan_assignments" (
  "id" TEXT NOT NULL,
  "organization_id" TEXT NOT NULL,
  "client_id" TEXT NOT NULL,
  "template_id" TEXT,
  "name" TEXT NOT NULL,
  "phase" TEXT,
  "target_calories" INTEGER NOT NULL,
  "protein_g" DECIMAL(8,2) NOT NULL,
  "carbs_g" DECIMAL(8,2) NOT NULL,
  "fat_g" DECIMAL(8,2) NOT NULL,
  "status" "meal_plan_assignment_status" NOT NULL DEFAULT 'active',
  "snapshot_json" JSONB NOT NULL,
  "starts_on" DATE NOT NULL,
  "ends_on" DATE,
  "created_by_user_id" TEXT,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "meal_plan_assignments_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "meal_plan_templates_organization_id_status_idx" ON "meal_plan_templates" ("organization_id", "status");
CREATE INDEX "meal_plan_templates_organization_id_name_idx" ON "meal_plan_templates" ("organization_id", "name");
CREATE INDEX "meal_plan_templates_created_by_user_id_idx" ON "meal_plan_templates" ("created_by_user_id");

CREATE INDEX "meal_plan_assignments_organization_id_client_id_status_idx" ON "meal_plan_assignments" ("organization_id", "client_id", "status");
CREATE INDEX "meal_plan_assignments_organization_id_template_id_idx" ON "meal_plan_assignments" ("organization_id", "template_id");
CREATE INDEX "meal_plan_assignments_created_by_user_id_idx" ON "meal_plan_assignments" ("created_by_user_id");

ALTER TABLE "meal_plan_templates" ADD CONSTRAINT "meal_plan_templates_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "meal_plan_templates" ADD CONSTRAINT "meal_plan_templates_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "meal_plan_assignments" ADD CONSTRAINT "meal_plan_assignments_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "meal_plan_assignments" ADD CONSTRAINT "meal_plan_assignments_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "meal_plan_assignments" ADD CONSTRAINT "meal_plan_assignments_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "meal_plan_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "meal_plan_assignments" ADD CONSTRAINT "meal_plan_assignments_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
