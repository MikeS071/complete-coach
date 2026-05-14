import { describe, expect, it } from "vitest";

import {
  createExternalApiKeySecret,
  hashExternalApiKey,
  verifyExternalApiKey
} from "@/lib/external/api-keys";
import { buildWebhookSignature, verifyWebhookSignature } from "@/lib/external/webhooks";

describe("external API domain helpers", () => {
  it("creates prefixed one-time API key secrets", () => {
    const key = createExternalApiKeySecret("test");

    expect(key.secret).toMatch(/^cc_test_/);
    expect(key.prefix).toBe(key.secret.slice(0, 16));
    expect(key.secret).not.toContain(" ");
  });

  it("hashes API keys and verifies only matching secrets", async () => {
    const { secret } = createExternalApiKeySecret("live");
    const hash = await hashExternalApiKey(secret);

    await expect(verifyExternalApiKey(secret, hash)).resolves.toBe(true);
    await expect(verifyExternalApiKey(`${secret}_wrong`, hash)).resolves.toBe(false);
    expect(hash).not.toContain(secret);
  });

  it("builds and verifies webhook signatures", () => {
    const payload = JSON.stringify({ event: "metric.extracted", id: "metric_1" });
    const timestamp = 1777248000;
    const secret = "whsec_test_secret";
    const signature = buildWebhookSignature({ payload, secret, timestamp });

    expect(signature).toMatch(/^v1=/);
    expect(verifyWebhookSignature({ payload, secret, signature, timestamp })).toBe(true);
    expect(
      verifyWebhookSignature({
        payload: JSON.stringify({ event: "tampered" }),
        secret,
        signature,
        timestamp
      })
    ).toBe(false);
  });
});
