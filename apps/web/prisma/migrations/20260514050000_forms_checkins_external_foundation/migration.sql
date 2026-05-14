-- Forms, check-ins, typed metrics, and external API foundation for Ticket 013A.

CREATE TYPE "form_type" AS ENUM ('check-in', 'intake', 'application', 'contact', 'habit-tracker');
CREATE TYPE "form_status" AS ENUM ('draft', 'published', 'archived');
CREATE TYPE "form_assignment_status" AS ENUM ('assigned', 'submitted', 'reviewed', 'completed', 'cancelled');
CREATE TYPE "form_submission_status" AS ENUM ('submitted', 'reviewed', 'completed');
CREATE TYPE "check_in_status" AS ENUM ('pending-review', 'reviewed', 'completed');
CREATE TYPE "external_api_key_status" AS ENUM ('active', 'revoked', 'expired');
CREATE TYPE "external_export_type" AS ENUM ('metrics', 'clients', 'form-submissions', 'check-ins');
CREATE TYPE "external_export_format" AS ENUM ('json', 'jsonl', 'csv');
CREATE TYPE "external_export_status" AS ENUM ('queued', 'running', 'completed', 'failed');
CREATE TYPE "external_webhook_endpoint_status" AS ENUM ('active', 'disabled');
CREATE TYPE "external_webhook_delivery_status" AS ENUM ('pending', 'succeeded', 'failed');

ALTER TABLE "clients" ADD COLUMN "external_client_id" TEXT;
ALTER TABLE "audit_logs" ADD COLUMN "actor_api_key_id" TEXT;

CREATE TABLE "forms" (
  "id" TEXT NOT NULL,
  "organization_id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "type" "form_type" NOT NULL,
  "status" "form_status" NOT NULL DEFAULT 'draft',
  "current_version_id" TEXT,
  "created_by_user_id" TEXT,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  "deleted_at" TIMESTAMPTZ(6),
  CONSTRAINT "forms_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "form_versions" (
  "id" TEXT NOT NULL,
  "organization_id" TEXT NOT NULL,
  "form_id" TEXT NOT NULL,
  "version_number" INTEGER NOT NULL,
  "schema_json" JSONB NOT NULL,
  "ui_json" JSONB,
  "published_at" TIMESTAMPTZ(6),
  "created_by_user_id" TEXT,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "form_versions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "form_assignments" (
  "id" TEXT NOT NULL,
  "organization_id" TEXT NOT NULL,
  "form_id" TEXT NOT NULL,
  "form_version_id" TEXT NOT NULL,
  "client_id" TEXT NOT NULL,
  "status" "form_assignment_status" NOT NULL DEFAULT 'assigned',
  "due_at" TIMESTAMPTZ(6),
  "completed_at" TIMESTAMPTZ(6),
  "created_by_user_id" TEXT,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "form_assignments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "form_submissions" (
  "id" TEXT NOT NULL,
  "organization_id" TEXT NOT NULL,
  "form_id" TEXT NOT NULL,
  "form_version_id" TEXT NOT NULL,
  "assignment_id" TEXT,
  "client_id" TEXT NOT NULL,
  "submitted_by_user_id" TEXT,
  "answers_json" JSONB NOT NULL,
  "status" "form_submission_status" NOT NULL DEFAULT 'submitted',
  "submitted_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "reviewed_at" TIMESTAMPTZ(6),
  "reviewed_by_user_id" TEXT,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "form_submissions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "check_ins" (
  "id" TEXT NOT NULL,
  "organization_id" TEXT NOT NULL,
  "client_id" TEXT NOT NULL,
  "form_submission_id" TEXT,
  "type" TEXT NOT NULL DEFAULT 'check-in',
  "status" "check_in_status" NOT NULL DEFAULT 'pending-review',
  "due_at" TIMESTAMPTZ(6),
  "submitted_at" TIMESTAMPTZ(6),
  "reviewed_at" TIMESTAMPTZ(6),
  "reviewed_by_user_id" TEXT,
  "summary" TEXT,
  "coach_notes" TEXT,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "check_ins_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "client_measurements" (
  "id" TEXT NOT NULL,
  "organization_id" TEXT NOT NULL,
  "client_id" TEXT NOT NULL,
  "source_type" TEXT NOT NULL,
  "source_id" TEXT NOT NULL,
  "measured_at" TIMESTAMPTZ(6) NOT NULL,
  "metric_key" TEXT NOT NULL,
  "metric_value" DECIMAL(18,6) NOT NULL,
  "unit" TEXT,
  "metadata" JSONB,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "client_measurements_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "external_api_keys" (
  "id" TEXT NOT NULL,
  "organization_id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "key_prefix" TEXT NOT NULL,
  "key_hash" TEXT NOT NULL,
  "scopes" JSONB NOT NULL,
  "status" "external_api_key_status" NOT NULL DEFAULT 'active',
  "allowed_ips" JSONB,
  "expires_at" TIMESTAMPTZ(6),
  "revoked_at" TIMESTAMPTZ(6),
  "last_used_at" TIMESTAMPTZ(6),
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "external_api_keys_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "external_export_jobs" (
  "id" TEXT NOT NULL,
  "organization_id" TEXT NOT NULL,
  "api_key_id" TEXT,
  "type" "external_export_type" NOT NULL,
  "format" "external_export_format" NOT NULL,
  "filters" JSONB,
  "status" "external_export_status" NOT NULL DEFAULT 'queued',
  "result_object_key" TEXT,
  "error_message" TEXT,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  "completed_at" TIMESTAMPTZ(6),
  CONSTRAINT "external_export_jobs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "external_webhook_endpoints" (
  "id" TEXT NOT NULL,
  "organization_id" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "description" TEXT,
  "event_types" JSONB NOT NULL,
  "signing_secret_hash" TEXT NOT NULL,
  "status" "external_webhook_endpoint_status" NOT NULL DEFAULT 'active',
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "external_webhook_endpoints_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "external_webhook_deliveries" (
  "id" TEXT NOT NULL,
  "organization_id" TEXT NOT NULL,
  "endpoint_id" TEXT NOT NULL,
  "event_type" TEXT NOT NULL,
  "payload_json" JSONB NOT NULL,
  "status" "external_webhook_delivery_status" NOT NULL DEFAULT 'pending',
  "attempt_count" INTEGER NOT NULL DEFAULT 0,
  "next_retry_at" TIMESTAMPTZ(6),
  "last_error" TEXT,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "external_webhook_deliveries_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "clients_organization_id_external_client_id_key" ON "clients" ("organization_id", "external_client_id");
CREATE INDEX "audit_logs_actor_api_key_id_created_at_idx" ON "audit_logs" ("actor_api_key_id", "created_at");

CREATE UNIQUE INDEX "forms_current_version_id_key" ON "forms" ("current_version_id");
CREATE INDEX "forms_organization_id_status_idx" ON "forms" ("organization_id", "status");
CREATE INDEX "forms_organization_id_type_idx" ON "forms" ("organization_id", "type");
CREATE INDEX "forms_created_by_user_id_idx" ON "forms" ("created_by_user_id");

CREATE UNIQUE INDEX "form_versions_form_id_version_number_key" ON "form_versions" ("form_id", "version_number");
CREATE INDEX "form_versions_organization_id_form_id_idx" ON "form_versions" ("organization_id", "form_id");
CREATE INDEX "form_versions_created_by_user_id_idx" ON "form_versions" ("created_by_user_id");

CREATE INDEX "form_assignments_organization_id_client_id_status_due_at_idx" ON "form_assignments" ("organization_id", "client_id", "status", "due_at");
CREATE INDEX "form_assignments_organization_id_form_id_status_idx" ON "form_assignments" ("organization_id", "form_id", "status");
CREATE INDEX "form_assignments_form_version_id_idx" ON "form_assignments" ("form_version_id");
CREATE INDEX "form_assignments_created_by_user_id_idx" ON "form_assignments" ("created_by_user_id");

CREATE INDEX "form_submissions_organization_id_client_id_submitted_at_idx" ON "form_submissions" ("organization_id", "client_id", "submitted_at");
CREATE INDEX "form_submissions_organization_id_status_submitted_at_idx" ON "form_submissions" ("organization_id", "status", "submitted_at");
CREATE INDEX "form_submissions_organization_id_form_id_submitted_at_idx" ON "form_submissions" ("organization_id", "form_id", "submitted_at");
CREATE INDEX "form_submissions_form_version_id_idx" ON "form_submissions" ("form_version_id");
CREATE INDEX "form_submissions_assignment_id_idx" ON "form_submissions" ("assignment_id");
CREATE INDEX "form_submissions_submitted_by_user_id_idx" ON "form_submissions" ("submitted_by_user_id");
CREATE INDEX "form_submissions_reviewed_by_user_id_idx" ON "form_submissions" ("reviewed_by_user_id");

CREATE UNIQUE INDEX "check_ins_form_submission_id_key" ON "check_ins" ("form_submission_id");
CREATE INDEX "check_ins_organization_id_status_due_at_idx" ON "check_ins" ("organization_id", "status", "due_at");
CREATE INDEX "check_ins_organization_id_client_id_submitted_at_idx" ON "check_ins" ("organization_id", "client_id", "submitted_at");
CREATE INDEX "check_ins_reviewed_by_user_id_idx" ON "check_ins" ("reviewed_by_user_id");

CREATE UNIQUE INDEX "client_measurements_organization_id_source_type_source_id_metric_key_key" ON "client_measurements" ("organization_id", "source_type", "source_id", "metric_key");
CREATE INDEX "client_measurements_organization_id_client_id_metric_key_measured_at_idx" ON "client_measurements" ("organization_id", "client_id", "metric_key", "measured_at");
CREATE INDEX "client_measurements_organization_id_source_type_source_id_idx" ON "client_measurements" ("organization_id", "source_type", "source_id");

CREATE UNIQUE INDEX "external_api_keys_key_prefix_key" ON "external_api_keys" ("key_prefix");
CREATE INDEX "external_api_keys_organization_id_status_idx" ON "external_api_keys" ("organization_id", "status");
CREATE INDEX "external_api_keys_organization_id_expires_at_idx" ON "external_api_keys" ("organization_id", "expires_at");

CREATE INDEX "external_export_jobs_organization_id_status_created_at_idx" ON "external_export_jobs" ("organization_id", "status", "created_at");
CREATE INDEX "external_export_jobs_api_key_id_created_at_idx" ON "external_export_jobs" ("api_key_id", "created_at");

CREATE INDEX "external_webhook_endpoints_organization_id_status_idx" ON "external_webhook_endpoints" ("organization_id", "status");
CREATE INDEX "external_webhook_deliveries_organization_id_status_next_retry_at_idx" ON "external_webhook_deliveries" ("organization_id", "status", "next_retry_at");
CREATE INDEX "external_webhook_deliveries_organization_id_endpoint_id_created_at_idx" ON "external_webhook_deliveries" ("organization_id", "endpoint_id", "created_at");

ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_api_key_id_fkey" FOREIGN KEY ("actor_api_key_id") REFERENCES "external_api_keys"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "forms" ADD CONSTRAINT "forms_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "forms" ADD CONSTRAINT "forms_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "form_versions" ADD CONSTRAINT "form_versions_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "form_versions" ADD CONSTRAINT "form_versions_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "forms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "form_versions" ADD CONSTRAINT "form_versions_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "forms" ADD CONSTRAINT "forms_current_version_id_fkey" FOREIGN KEY ("current_version_id") REFERENCES "form_versions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "form_assignments" ADD CONSTRAINT "form_assignments_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "form_assignments" ADD CONSTRAINT "form_assignments_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "forms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "form_assignments" ADD CONSTRAINT "form_assignments_form_version_id_fkey" FOREIGN KEY ("form_version_id") REFERENCES "form_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "form_assignments" ADD CONSTRAINT "form_assignments_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "form_assignments" ADD CONSTRAINT "form_assignments_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "form_submissions" ADD CONSTRAINT "form_submissions_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "form_submissions" ADD CONSTRAINT "form_submissions_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "forms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "form_submissions" ADD CONSTRAINT "form_submissions_form_version_id_fkey" FOREIGN KEY ("form_version_id") REFERENCES "form_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "form_submissions" ADD CONSTRAINT "form_submissions_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "form_assignments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "form_submissions" ADD CONSTRAINT "form_submissions_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "form_submissions" ADD CONSTRAINT "form_submissions_submitted_by_user_id_fkey" FOREIGN KEY ("submitted_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "form_submissions" ADD CONSTRAINT "form_submissions_reviewed_by_user_id_fkey" FOREIGN KEY ("reviewed_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "check_ins" ADD CONSTRAINT "check_ins_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "check_ins" ADD CONSTRAINT "check_ins_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "check_ins" ADD CONSTRAINT "check_ins_form_submission_id_fkey" FOREIGN KEY ("form_submission_id") REFERENCES "form_submissions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "check_ins" ADD CONSTRAINT "check_ins_reviewed_by_user_id_fkey" FOREIGN KEY ("reviewed_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "client_measurements" ADD CONSTRAINT "client_measurements_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "client_measurements" ADD CONSTRAINT "client_measurements_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "external_api_keys" ADD CONSTRAINT "external_api_keys_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "external_export_jobs" ADD CONSTRAINT "external_export_jobs_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "external_export_jobs" ADD CONSTRAINT "external_export_jobs_api_key_id_fkey" FOREIGN KEY ("api_key_id") REFERENCES "external_api_keys"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "external_webhook_endpoints" ADD CONSTRAINT "external_webhook_endpoints_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "external_webhook_deliveries" ADD CONSTRAINT "external_webhook_deliveries_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "external_webhook_deliveries" ADD CONSTRAINT "external_webhook_deliveries_endpoint_id_fkey" FOREIGN KEY ("endpoint_id") REFERENCES "external_webhook_endpoints"("id") ON DELETE CASCADE ON UPDATE CASCADE;
