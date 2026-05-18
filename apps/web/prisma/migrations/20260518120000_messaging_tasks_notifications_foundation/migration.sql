-- Messaging, tasks, notifications, and email delivery persistence for Ticket 016A.

CREATE TYPE "task_category" AS ENUM ('current-client-care', 'social-media', 'business-operations');
CREATE TYPE "task_priority" AS ENUM ('high', 'medium', 'low');
CREATE TYPE "task_status" AS ENUM ('open', 'completed', 'cancelled');
CREATE TYPE "email_delivery_status" AS ENUM ('queued', 'sent', 'delivered', 'bounced', 'complained', 'failed');

CREATE TABLE "conversations" (
  "id" TEXT NOT NULL,
  "organization_id" TEXT NOT NULL,
  "client_id" TEXT NOT NULL,
  "title" TEXT,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "messages" (
  "id" TEXT NOT NULL,
  "organization_id" TEXT NOT NULL,
  "conversation_id" TEXT NOT NULL,
  "sender_user_id" TEXT,
  "sender_client_id" TEXT,
  "body" TEXT NOT NULL,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "edited_at" TIMESTAMPTZ(6),
  "deleted_at" TIMESTAMPTZ(6),
  CONSTRAINT "messages_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "messages_one_sender_check" CHECK (
    ("sender_user_id" IS NOT NULL AND "sender_client_id" IS NULL)
    OR ("sender_user_id" IS NULL AND "sender_client_id" IS NOT NULL)
  )
);

CREATE TABLE "message_attachments" (
  "id" TEXT NOT NULL,
  "organization_id" TEXT NOT NULL,
  "message_id" TEXT NOT NULL,
  "object_id" TEXT NOT NULL,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "message_attachments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "message_receipts" (
  "id" TEXT NOT NULL,
  "organization_id" TEXT NOT NULL,
  "message_id" TEXT NOT NULL,
  "user_id" TEXT,
  "client_id" TEXT,
  "read_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "message_receipts_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "message_receipts_one_reader_check" CHECK (
    ("user_id" IS NOT NULL AND "client_id" IS NULL)
    OR ("user_id" IS NULL AND "client_id" IS NOT NULL)
  )
);

CREATE TABLE "notifications" (
  "id" TEXT NOT NULL,
  "organization_id" TEXT NOT NULL,
  "recipient_user_id" TEXT,
  "recipient_client_id" TEXT,
  "type" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "body" TEXT,
  "entity_type" TEXT,
  "entity_id" TEXT,
  "read_at" TIMESTAMPTZ(6),
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "notifications_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "notifications_one_recipient_check" CHECK (
    ("recipient_user_id" IS NOT NULL AND "recipient_client_id" IS NULL)
    OR ("recipient_user_id" IS NULL AND "recipient_client_id" IS NOT NULL)
  )
);

CREATE TABLE "tasks" (
  "id" TEXT NOT NULL,
  "organization_id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "category" "task_category" NOT NULL,
  "priority" "task_priority" NOT NULL DEFAULT 'medium',
  "status" "task_status" NOT NULL DEFAULT 'open',
  "due_at" TIMESTAMPTZ(6),
  "assigned_user_id" TEXT,
  "client_id" TEXT,
  "created_by_user_id" TEXT,
  "completed_at" TIMESTAMPTZ(6),
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "email_deliveries" (
  "id" TEXT NOT NULL,
  "organization_id" TEXT NOT NULL,
  "notification_id" TEXT,
  "provider" TEXT NOT NULL DEFAULT 'resend',
  "provider_email_id" TEXT,
  "to_email" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "status" "email_delivery_status" NOT NULL DEFAULT 'queued',
  "event_type" TEXT,
  "error_message" TEXT,
  "metadata" JSONB,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "email_deliveries_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "conversations_organization_id_client_id_idx" ON "conversations" ("organization_id", "client_id");
CREATE INDEX "conversations_organization_id_updated_at_idx" ON "conversations" ("organization_id", "updated_at");

CREATE INDEX "messages_organization_id_conversation_id_created_at_idx" ON "messages" ("organization_id", "conversation_id", "created_at");
CREATE INDEX "messages_sender_user_id_created_at_idx" ON "messages" ("sender_user_id", "created_at");
CREATE INDEX "messages_sender_client_id_created_at_idx" ON "messages" ("sender_client_id", "created_at");

CREATE INDEX "message_attachments_organization_id_message_id_idx" ON "message_attachments" ("organization_id", "message_id");
CREATE INDEX "message_attachments_organization_id_object_id_idx" ON "message_attachments" ("organization_id", "object_id");

CREATE UNIQUE INDEX "message_receipts_message_id_user_id_key" ON "message_receipts" ("message_id", "user_id");
CREATE UNIQUE INDEX "message_receipts_message_id_client_id_key" ON "message_receipts" ("message_id", "client_id");
CREATE INDEX "message_receipts_organization_id_message_id_idx" ON "message_receipts" ("organization_id", "message_id");
CREATE INDEX "message_receipts_organization_id_user_id_idx" ON "message_receipts" ("organization_id", "user_id");
CREATE INDEX "message_receipts_organization_id_client_id_idx" ON "message_receipts" ("organization_id", "client_id");

CREATE INDEX "notifications_organization_id_recipient_user_id_read_at_created_at_idx" ON "notifications" ("organization_id", "recipient_user_id", "read_at", "created_at");
CREATE INDEX "notifications_organization_id_recipient_client_id_read_at_created_at_idx" ON "notifications" ("organization_id", "recipient_client_id", "read_at", "created_at");
CREATE INDEX "notifications_organization_id_entity_type_entity_id_idx" ON "notifications" ("organization_id", "entity_type", "entity_id");

CREATE INDEX "tasks_organization_id_status_due_at_idx" ON "tasks" ("organization_id", "status", "due_at");
CREATE INDEX "tasks_organization_id_assigned_user_id_status_idx" ON "tasks" ("organization_id", "assigned_user_id", "status");
CREATE INDEX "tasks_organization_id_client_id_status_idx" ON "tasks" ("organization_id", "client_id", "status");
CREATE INDEX "tasks_created_by_user_id_idx" ON "tasks" ("created_by_user_id");

CREATE INDEX "email_deliveries_organization_id_status_created_at_idx" ON "email_deliveries" ("organization_id", "status", "created_at");
CREATE INDEX "email_deliveries_organization_id_notification_id_idx" ON "email_deliveries" ("organization_id", "notification_id");
CREATE INDEX "email_deliveries_organization_id_provider_email_id_idx" ON "email_deliveries" ("organization_id", "provider_email_id");

ALTER TABLE "conversations" ADD CONSTRAINT "conversations_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "messages" ADD CONSTRAINT "messages_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_user_id_fkey" FOREIGN KEY ("sender_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_client_id_fkey" FOREIGN KEY ("sender_client_id") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "message_attachments" ADD CONSTRAINT "message_attachments_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "message_attachments" ADD CONSTRAINT "message_attachments_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "message_receipts" ADD CONSTRAINT "message_receipts_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "message_receipts" ADD CONSTRAINT "message_receipts_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "message_receipts" ADD CONSTRAINT "message_receipts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "message_receipts" ADD CONSTRAINT "message_receipts_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "notifications" ADD CONSTRAINT "notifications_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_recipient_user_id_fkey" FOREIGN KEY ("recipient_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_recipient_client_id_fkey" FOREIGN KEY ("recipient_client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "tasks" ADD CONSTRAINT "tasks_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assigned_user_id_fkey" FOREIGN KEY ("assigned_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "email_deliveries" ADD CONSTRAINT "email_deliveries_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "email_deliveries" ADD CONSTRAINT "email_deliveries_notification_id_fkey" FOREIGN KEY ("notification_id") REFERENCES "notifications"("id") ON DELETE SET NULL ON UPDATE CASCADE;
