import { expect, test } from "@playwright/test";

test.describe("Auth foundation", () => {
  test("renders the sign-in surface", async ({ page }) => {
    await page.goto("/sign-in");

    await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
    await expect(page.getByRole("navigation", { name: /primary navigation/i })).toHaveCount(0);
    await expect(page.getByRole("searchbox", { name: /search tasks/i })).toHaveCount(0);
  });

  test("signs in with seeded demo owner credentials", async ({ page }) => {
    test.skip(
      !process.env.DEMO_COACH_EMAIL || !process.env.DEMO_COACH_PASSWORD,
      "DEMO_COACH_EMAIL and DEMO_COACH_PASSWORD are required for the auth login smoke test."
    );

    await page.goto("/sign-in");
    await page.getByLabel("Email").fill(process.env.DEMO_COACH_EMAIL ?? "");
    await page.getByLabel("Password").fill(process.env.DEMO_COACH_PASSWORD ?? "");
    await page.getByRole("button", { name: "Sign in" }).click();

    await page.waitForURL(/\/$/, { timeout: 20_000 });
    await expect(page.getByText("Complete Coach Demo · owner")).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign out" })).toBeVisible();

    await page.getByRole("button", { name: "Sign out" }).click();

    await page.waitForURL(/\/sign-in$/, { timeout: 20_000 });
    await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
    await expect(page.getByRole("navigation", { name: /primary navigation/i })).toHaveCount(0);
  });
});
