-- Payment/package persistence foundation for Ticket 017A.

CREATE TYPE "package_billing_interval" AS ENUM ('monthly', 'one-time');
CREATE TYPE "package_status" AS ENUM ('active', 'archived');
CREATE TYPE "client_subscription_status" AS ENUM (
  'incomplete',
  'incomplete-expired',
  'trialing',
  'active',
  'past-due',
  'canceled',
  'unpaid',
  'paused'
);
CREATE TYPE "payment_event_processing_status" AS ENUM ('received', 'processed', 'failed', 'ignored');

CREATE TABLE "packages" (
  "id" TEXT NOT NULL,
  "organization_id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "price_amount" INTEGER NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'usd',
  "billing_interval" "package_billing_interval" NOT NULL,
  "stripe_product_id" TEXT,
  "stripe_price_id" TEXT,
  "status" "package_status" NOT NULL DEFAULT 'active',
  "features_json" JSONB,
  "color" TEXT,
  "created_by_user_id" TEXT,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  "deleted_at" TIMESTAMPTZ(6),
  CONSTRAINT "packages_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "client_subscriptions" (
  "id" TEXT NOT NULL,
  "organization_id" TEXT NOT NULL,
  "client_id" TEXT NOT NULL,
  "package_id" TEXT NOT NULL,
  "stripe_customer_id" TEXT,
  "stripe_subscription_id" TEXT,
  "status" "client_subscription_status" NOT NULL DEFAULT 'incomplete',
  "current_period_start" TIMESTAMPTZ(6),
  "current_period_end" TIMESTAMPTZ(6),
  "cancel_at" TIMESTAMPTZ(6),
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "client_subscriptions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "payment_events" (
  "id" TEXT NOT NULL,
  "organization_id" TEXT NOT NULL,
  "stripe_event_id" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "payload_json" JSONB NOT NULL,
  "processed_at" TIMESTAMPTZ(6),
  "processing_status" "payment_event_processing_status" NOT NULL DEFAULT 'received',
  "error_message" TEXT,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "payment_events_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "packages_organization_id_stripe_product_id_key" ON "packages" ("organization_id", "stripe_product_id");
CREATE UNIQUE INDEX "packages_organization_id_stripe_price_id_key" ON "packages" ("organization_id", "stripe_price_id");
CREATE INDEX "packages_organization_id_status_idx" ON "packages" ("organization_id", "status");
CREATE INDEX "packages_organization_id_name_idx" ON "packages" ("organization_id", "name");
CREATE INDEX "packages_created_by_user_id_idx" ON "packages" ("created_by_user_id");

CREATE UNIQUE INDEX "client_subscriptions_organization_id_stripe_subscription_id_key" ON "client_subscriptions" ("organization_id", "stripe_subscription_id");
CREATE INDEX "client_subscriptions_organization_id_client_id_status_idx" ON "client_subscriptions" ("organization_id", "client_id", "status");
CREATE INDEX "client_subscriptions_organization_id_package_id_status_idx" ON "client_subscriptions" ("organization_id", "package_id", "status");
CREATE INDEX "client_subscriptions_organization_id_stripe_customer_id_idx" ON "client_subscriptions" ("organization_id", "stripe_customer_id");

CREATE UNIQUE INDEX "payment_events_stripe_event_id_key" ON "payment_events" ("stripe_event_id");
CREATE INDEX "payment_events_organization_id_processing_status_created_at_idx" ON "payment_events" ("organization_id", "processing_status", "created_at");
CREATE INDEX "payment_events_organization_id_type_created_at_idx" ON "payment_events" ("organization_id", "type", "created_at");

ALTER TABLE "packages" ADD CONSTRAINT "packages_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "packages" ADD CONSTRAINT "packages_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "client_subscriptions" ADD CONSTRAINT "client_subscriptions_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "client_subscriptions" ADD CONSTRAINT "client_subscriptions_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "client_subscriptions" ADD CONSTRAINT "client_subscriptions_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "packages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "payment_events" ADD CONSTRAINT "payment_events_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
