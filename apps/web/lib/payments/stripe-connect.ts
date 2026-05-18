import { z } from "zod";

export class StripeConfigurationError extends Error {
  constructor() {
    super("Stripe is not configured.");
    this.name = "StripeConfigurationError";
  }
}

export class StripeApiError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
    this.name = "StripeApiError";
  }
}

interface StripeConfig {
  secretKey: string;
  apiBaseUrl: string;
}

interface StripeAccount {
  id: string;
  details_submitted?: boolean;
  charges_enabled?: boolean;
  payouts_enabled?: boolean;
}

interface StripeAccountLink {
  object: "account_link";
  created: number;
  expires_at: number;
  url: string;
}

interface StripeProduct {
  id: string;
}

interface StripePrice {
  id: string;
}

export const stripeAccountLinkSchema = z.object({
  returnUrl: z.string().url().optional(),
  refreshUrl: z.string().url().optional()
});

export type StripeAccountLinkInput = z.infer<typeof stripeAccountLinkSchema>;

export function getStripeConfig(): StripeConfig {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new StripeConfigurationError();
  }

  return {
    secretKey,
    apiBaseUrl: process.env.STRIPE_API_BASE_URL ?? "https://api.stripe.com"
  };
}

export async function createConnectedAccount(config: StripeConfig, input: { organizationId: string; email?: string }) {
  const account = await postStripeForm<StripeAccount>(config, "/v1/accounts", {
    type: "express",
    email: input.email,
    "capabilities[card_payments][requested]": "true",
    "capabilities[transfers][requested]": "true",
    "metadata[organization_id]": input.organizationId
  });

  return {
    accountId: account.id,
    status: deriveConnectStatus(account)
  };
}

export async function createAccountLink(
  config: StripeConfig,
  input: { accountId: string; returnUrl: string; refreshUrl: string }
) {
  return postStripeForm<StripeAccountLink>(config, "/v1/account_links", {
    account: input.accountId,
    return_url: input.returnUrl,
    refresh_url: input.refreshUrl,
    type: "account_onboarding"
  });
}

export async function createStripeProduct(
  config: StripeConfig,
  input: { organizationId: string; packageId: string; name: string; description?: string | null }
) {
  return postStripeForm<StripeProduct>(config, "/v1/products", {
    name: input.name,
    description: input.description ?? undefined,
    "metadata[organization_id]": input.organizationId,
    "metadata[package_id]": input.packageId
  });
}

export async function createStripePrice(
  config: StripeConfig,
  input: {
    organizationId: string;
    packageId: string;
    productId: string;
    unitAmount: number;
    currency: string;
    recurringInterval?: "month";
  }
) {
  return postStripeForm<StripePrice>(config, "/v1/prices", {
    product: input.productId,
    unit_amount: String(input.unitAmount),
    currency: input.currency,
    ...(input.recurringInterval ? { "recurring[interval]": input.recurringInterval } : {}),
    "metadata[organization_id]": input.organizationId,
    "metadata[package_id]": input.packageId
  });
}

export function deriveConnectStatus(account: StripeAccount) {
  if (account.charges_enabled && account.payouts_enabled) {
    return "active";
  }

  if (account.details_submitted) {
    return "pending-review";
  }

  return "onboarding-required";
}

export function buildDefaultConnectReturnUrls(requestUrl: string) {
  const origin = new URL(requestUrl).origin;

  return {
    returnUrl: `${origin}/packages?stripe_connect=return`,
    refreshUrl: `${origin}/packages?stripe_connect=refresh`
  };
}

async function postStripeForm<T>(config: StripeConfig, path: string, fields: Record<string, string | undefined>) {
  const body = new URLSearchParams();

  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined) {
      body.set(key, value);
    }
  });

  const response = await fetch(`${config.apiBaseUrl}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${config.secretKey}:`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new StripeApiError(getStripeErrorMessage(payload), response.status);
  }

  return payload as T;
}

function getStripeErrorMessage(payload: unknown) {
  if (
    typeof payload === "object" &&
    payload !== null &&
    "error" in payload &&
    typeof (payload as { error?: { message?: unknown } }).error?.message === "string"
  ) {
    return (payload as { error: { message: string } }).error.message;
  }

  return "Stripe request failed.";
}
