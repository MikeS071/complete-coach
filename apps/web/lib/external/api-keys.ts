import { randomBytes } from "node:crypto";
import { compare, hash } from "bcryptjs";

export type ExternalApiKeyEnvironment = "live" | "test";

export interface ExternalApiKeySecret {
  prefix: string;
  secret: string;
}

export function createExternalApiKeySecret(environment: ExternalApiKeyEnvironment): ExternalApiKeySecret {
  const secret = `cc_${environment}_${randomBytes(32).toString("base64url")}`;

  return {
    prefix: secret.slice(0, 16),
    secret
  };
}

export async function hashExternalApiKey(secret: string) {
  return hash(secret, 12);
}

export async function verifyExternalApiKey(secret: string, secretHash: string) {
  return compare(secret, secretHash);
}
