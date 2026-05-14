import { z } from "zod";
import { describe, expect, it, vi } from "vitest";

import { handleApiError } from "@/lib/api/responses";
import {
  ActiveOrganizationRequiredError,
  AuthenticationRequiredError
} from "@/lib/auth/session-guards";
import { ForbiddenError } from "@/lib/auth/permissions";

describe("API response helpers", () => {
  it("maps expected auth and validation errors to stable envelopes", async () => {
    await expectJson(handleApiError(new AuthenticationRequiredError()), 401, "unauthorized");
    await expectJson(
      handleApiError(new ActiveOrganizationRequiredError()),
      403,
      "active_organization_required"
    );
    await expectJson(handleApiError(new ForbiddenError("assistant", "clients:write")), 403, "forbidden");
    await expectJson(
      handleApiError(z.object({ email: z.string().email() }).safeParse({ email: "bad" }).error),
      422,
      "validation_failed"
    );
  });

  it("maps unexpected errors without exposing raw details", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

    await expectJson(handleApiError(new Error("database password leaked")), 500, "internal_error");

    consoleError.mockRestore();
  });

  it("maps known database setup and connectivity errors without stack traces", async () => {
    const consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

    await expectJson(handleApiError({ code: "P2021" }), 503, "database_schema_unavailable");
    await expectJson(handleApiError({ code: "ETIMEDOUT" }), 503, "database_unavailable");

    expect(consoleWarn).toHaveBeenCalledTimes(2);
    expect(consoleError).not.toHaveBeenCalled();

    consoleWarn.mockRestore();
    consoleError.mockRestore();
  });
});

async function expectJson(response: Response, status: number, code: string) {
  const payload = (await response.json()) as { error: { code: string; message: string } };

  expect(response.status).toBe(status);
  expect(payload.error.code).toBe(code);
  expect(payload.error.message).not.toContain("password");
}
