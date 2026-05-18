-- Track Stripe Checkout sessions that initiate client subscription records.

ALTER TABLE "client_subscriptions"
  ADD COLUMN "stripe_checkout_session_id" TEXT;

CREATE UNIQUE INDEX "client_subscriptions_organization_id_stripe_checkout_session_id_key"
  ON "client_subscriptions" ("organization_id", "stripe_checkout_session_id");
