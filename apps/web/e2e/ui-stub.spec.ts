import { expect, test, type Page } from "@playwright/test";

const routeCases = [
  { path: "/", heading: "Coach Operations Dashboard" },
  { path: "/training", heading: "Training Programs" },
  { path: "/training/programs", heading: "Program Library" },
  { path: "/training/exercises", heading: "The Movement Vault" },
  { path: "/training/exercises/add", heading: "Add New Exercise" },
  { path: "/nutrition", heading: "Nutrition Plans" },
  { path: "/nutrition/meal-plans", heading: "Meal Plan Library" },
  { path: "/nutrition/food-database", heading: "Food Database" },
  { path: "/education", heading: "Educational Vault" },
  { path: "/education/add", heading: "Upload New Resource" },
  { path: "/supplementation", heading: "Supplementation" },
  { path: "/supplementation/plans", heading: "Supplementation Hub" },
  { path: "/supplementation/database", heading: "Supplementation Library" },
  { path: "/clients", heading: "Client Roster" },
  { path: "/clients/1", heading: "Marcus Rodriguez" },
  { path: "/clients/crm", heading: "Client Relationship Management" },
  { path: "/clients/check-ins", heading: "Check In Review Center" },
  { path: "/forms", heading: "Create a New Form" },
  { path: "/messages", heading: "Messages" },
  { path: "/packages", heading: "Packages & Pricing" },
  { path: "/team-management", heading: "Team Management" },
  { path: "/social-media", heading: "Social Media Hub" }
] as const;

function collectPageErrors(page: Page) {
  const errors: string[] = [];

  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") {
      errors.push(message.text());
    }
  });

  return errors;
}

test.describe("UI stub navigation smoke", () => {
  for (const route of routeCases) {
    test(`renders ${route.path}`, async ({ page }) => {
      const errors = collectPageErrors(page);

      await page.goto(route.path);

      await expect(page.getByRole("heading", { level: 1, name: route.heading })).toBeVisible();
      await expect(page.getByRole("navigation", { name: "Primary navigation" })).toBeVisible();
      await expect(page.getByRole("link", { name: "Complete Coach dashboard" })).toBeVisible();
      expect(errors).toEqual([]);
    });
  }

  test("primary navigation can move through representative sections", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("link", { name: "Training", exact: true }).click();
    await expect(page).toHaveURL(/\/training$/);
    await expect(page.getByRole("heading", { level: 1, name: "Training Programs" })).toBeVisible();

    await page.getByRole("link", { name: "Meal Plans" }).click();
    await expect(page).toHaveURL(/\/nutrition\/meal-plans$/);
    await expect(page.getByRole("heading", { level: 1, name: "Meal Plan Library" })).toBeVisible();

    await page.getByRole("link", { name: "Messages" }).click();
    await expect(page).toHaveURL(/\/messages$/);
    await expect(page.getByRole("heading", { level: 1, name: "Messages" })).toBeVisible();
  });
});

test.describe("UI stub accessibility smoke", () => {
  for (const route of routeCases) {
    test(`${route.path} has named interactive controls and a usable heading structure`, async ({ page }) => {
      await page.goto(route.path);

      await expect(page.getByRole("heading", { level: 1, name: route.heading })).toBeVisible();

      const unnamedControls = await page.locator("a[href], button, input, textarea, select").evaluateAll((elements) =>
        elements
          .map((element) => {
            const tagName = element.tagName.toLowerCase();
            const label = [
              element.getAttribute("aria-label"),
              element.getAttribute("title"),
              element.textContent,
              element.getAttribute("placeholder"),
              element.getAttribute("alt")
            ]
              .filter(Boolean)
              .join(" ")
              .trim();

            return {
              tagName,
              label,
              html: element.outerHTML.slice(0, 180)
            };
          })
          .filter((control) => control.label.length === 0)
      );

      expect(unnamedControls).toEqual([]);
    });
  }

  test("keyboard focus reaches global navigation and page controls", async ({ page }) => {
    await page.goto("/supplementation/database");

    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "Complete Coach dashboard" })).toBeFocused();

    await page.getByRole("button", { name: "New Entry" }).focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("dialog", { name: "New Protocol" })).toBeVisible();
    await page.getByRole("button", { name: "Close new protocol panel" }).focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("dialog", { name: "New Protocol" })).toBeHidden();
  });
});
