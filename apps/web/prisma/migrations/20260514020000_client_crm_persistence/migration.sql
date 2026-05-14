-- Client and CRM persistence foundation for Ticket 012.

CREATE TYPE "client_status" AS ENUM ('active', 'archived', 'new', 'deactivated');
CREATE TYPE "lead_status" AS ENUM ('hot', 'warm', 'cold');
CREATE TYPE "lead_stage" AS ENUM ('initial-contact', 'consultation', 'proposal', 'negotiation', 'closed-won');
CREATE TYPE "lead_activity_type" AS ENUM ('note', 'email', 'call', 'stage-transition');

CREATE TABLE "clients" (
  "id" TEXT NOT NULL,
  "organization_id" TEXT NOT NULL,
  "client_user_id" TEXT,
  "first_name" TEXT NOT NULL,
  "last_name" TEXT NOT NULL,
  "email" TEXT,
  "phone" TEXT,
  "status" "client_status" NOT NULL DEFAULT 'new',
  "package_id" TEXT,
  "package_name" TEXT,
  "primary_coach_user_id" TEXT,
  "check_in_day" TEXT,
  "timezone" TEXT NOT NULL DEFAULT 'UTC',
  "start_date" DATE,
  "latest_check_in_at" TIMESTAMPTZ(6),
  "compliance" INTEGER NOT NULL DEFAULT 0,
  "archived_at" TIMESTAMPTZ(6),
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  "deleted_at" TIMESTAMPTZ(6),
  CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "client_profiles" (
  "id" TEXT NOT NULL,
  "organization_id" TEXT NOT NULL,
  "client_id" TEXT NOT NULL,
  "date_of_birth" DATE,
  "sex" TEXT,
  "goals" JSONB,
  "injuries" JSONB,
  "medical_notes" TEXT,
  "bio" TEXT,
  "emergency_contact" JSONB,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "client_profiles_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "leads" (
  "id" TEXT NOT NULL,
  "organization_id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT,
  "phone" TEXT,
  "source" TEXT,
  "status" "lead_status" NOT NULL DEFAULT 'warm',
  "stage" "lead_stage" NOT NULL DEFAULT 'initial-contact',
  "location" TEXT,
  "notes" TEXT,
  "last_contact_at" TIMESTAMPTZ(6),
  "days_in_stage" INTEGER NOT NULL DEFAULT 0,
  "assigned_user_id" TEXT,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  "deleted_at" TIMESTAMPTZ(6),
  CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "lead_activities" (
  "id" TEXT NOT NULL,
  "organization_id" TEXT NOT NULL,
  "lead_id" TEXT NOT NULL,
  "actor_user_id" TEXT,
  "type" "lead_activity_type" NOT NULL,
  "body" TEXT,
  "occurred_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "lead_activities_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "clients_organization_id_status_idx" ON "clients" ("organization_id", "status");
CREATE INDEX "clients_organization_id_primary_coach_user_id_idx" ON "clients" ("organization_id", "primary_coach_user_id");
CREATE INDEX "clients_organization_id_check_in_day_idx" ON "clients" ("organization_id", "check_in_day");
CREATE INDEX "clients_client_user_id_idx" ON "clients" ("client_user_id");
CREATE UNIQUE INDEX "clients_organization_id_email_active_key" ON "clients" ("organization_id", "email") WHERE "email" IS NOT NULL AND "deleted_at" IS NULL;

CREATE UNIQUE INDEX "client_profiles_client_id_key" ON "client_profiles" ("client_id");
CREATE INDEX "client_profiles_organization_id_client_id_idx" ON "client_profiles" ("organization_id", "client_id");

CREATE INDEX "leads_organization_id_stage_idx" ON "leads" ("organization_id", "stage");
CREATE INDEX "leads_organization_id_status_idx" ON "leads" ("organization_id", "status");
CREATE INDEX "leads_organization_id_assigned_user_id_idx" ON "leads" ("organization_id", "assigned_user_id");
CREATE INDEX "leads_organization_id_email_idx" ON "leads" ("organization_id", "email");

CREATE INDEX "lead_activities_organization_id_lead_id_occurred_at_idx" ON "lead_activities" ("organization_id", "lead_id", "occurred_at");
CREATE INDEX "lead_activities_actor_user_id_occurred_at_idx" ON "lead_activities" ("actor_user_id", "occurred_at");

ALTER TABLE "clients" ADD CONSTRAINT "clients_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "clients" ADD CONSTRAINT "clients_client_user_id_fkey" FOREIGN KEY ("client_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "clients" ADD CONSTRAINT "clients_primary_coach_user_id_fkey" FOREIGN KEY ("primary_coach_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "client_profiles" ADD CONSTRAINT "client_profiles_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "client_profiles" ADD CONSTRAINT "client_profiles_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "leads" ADD CONSTRAINT "leads_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "leads" ADD CONSTRAINT "leads_assigned_user_id_fkey" FOREIGN KEY ("assigned_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "lead_activities" ADD CONSTRAINT "lead_activities_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "lead_activities" ADD CONSTRAINT "lead_activities_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "lead_activities" ADD CONSTRAINT "lead_activities_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
