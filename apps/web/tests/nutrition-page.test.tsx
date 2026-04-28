import { fireEvent, render, screen, within } from "@testing-library/react";
import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { FoodDatabasePage } from "@/components/nutrition/food-database-page";
import { MealPlansPage } from "@/components/nutrition/meal-plans-page";
import { NutritionPage } from "@/components/nutrition/nutrition-page";

describe("NutritionPage", () => {
  it("renders nutrition overview cards and recent logs", () => {
    render(createElement(NutritionPage));

    expect(screen.getByRole("heading", { level: 1, name: "Nutrition Plans" })).toBeInTheDocument();
    expect(screen.getByText("Active Meal Plans")).toBeInTheDocument();
    expect(screen.getByText("High Performance Macro Split")).toBeInTheDocument();
    expect(screen.getByText("Recent Meal Logs")).toBeInTheDocument();
  });
});

describe("MealPlansPage", () => {
  it("switches between active assignments and master templates", () => {
    render(createElement(MealPlansPage));

    expect(screen.getByRole("heading", { level: 1, name: "Meal Plan Library" })).toBeInTheDocument();
    expect(screen.getByText("James S. Miller")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "Master Nutrition Templates" }));

    expect(screen.getByRole("tabpanel", { name: "Master Nutrition Templates" })).toHaveTextContent(
      "High-Protein Breakfast Bowl"
    );
    expect(screen.queryByText("James S. Miller")).not.toBeInTheDocument();
  });

  it("renders meal-plan actions", () => {
    render(createElement(MealPlansPage));

    expect(screen.getByRole("button", { name: "Recipes" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Access Protocol" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "View All Active" })).toBeInTheDocument();
  });
});

describe("FoodDatabasePage", () => {
  it("searches foods by name", () => {
    render(createElement(FoodDatabasePage));

    fireEvent.change(screen.getByRole("searchbox", { name: /search foods/i }), {
      target: { value: "rice" }
    });

    expect(screen.getByText("Basmati Rice")).toBeInTheDocument();
    expect(screen.queryByText("Chicken Breast")).not.toBeInTheDocument();
  });

  it("filters foods by category", () => {
    render(createElement(FoodDatabasePage));

    fireEvent.click(screen.getByRole("button", { name: "Proteins" }));

    const grid = screen.getByRole("region", { name: "Food grid" });
    expect(within(grid).getByText("Chicken Breast")).toBeInTheDocument();
    expect(within(grid).getByText("Whey Isolate")).toBeInTheDocument();
    expect(within(grid).queryByText("Basmati Rice")).not.toBeInTheDocument();
  });

  it("updates pagination controls locally", () => {
    render(createElement(FoodDatabasePage));

    expect(screen.getByRole("status", { name: "Food database page" })).toHaveTextContent("Page 1");

    fireEvent.click(screen.getByRole("button", { name: "Next food page" }));

    expect(screen.getByRole("status", { name: "Food database page" })).toHaveTextContent("Page 2");

    fireEvent.click(screen.getByRole("button", { name: "Previous food page" }));

    expect(screen.getByRole("status", { name: "Food database page" })).toHaveTextContent("Page 1");
  });
});
