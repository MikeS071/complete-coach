import { createHmac, timingSafeEqual } from "node:crypto";

interface WebhookSignatureInput {
  payload: string;
  secret: string;
  timestamp: number;
}

export function buildWebhookSignature({ payload, secret, timestamp }: WebhookSignatureInput) {
  const digest = createHmac("sha256", secret).update(`${timestamp}.${payload}`).digest("hex");

  return `v1=${digest}`;
}

export function verifyWebhookSignature(input: WebhookSignatureInput & { signature: string }) {
  const expected = buildWebhookSignature(input);
  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(input.signature);

  if (expectedBuffer.length !== actualBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, actualBuffer);
}
