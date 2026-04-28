import { fireEvent, render, screen, within } from "@testing-library/react";
import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { AddExercisePage } from "@/components/training/add-exercise-page";
import { ExerciseDatabasePage } from "@/components/training/exercise-database-page";
import { TrainingProgramsPage } from "@/components/training/training-programs-page";
import { TrainingPage } from "@/components/training/training-page";

describe("TrainingPage", () => {
  it("renders training overview cards and recent workout activity", () => {
    render(createElement(TrainingPage));

    expect(screen.getByRole("heading", { level: 1, name: "Training Programs" })).toBeInTheDocument();
    expect(screen.getByText("Active Athletes")).toBeInTheDocument();
    expect(screen.getAllByText("Elite Strength - Phase 2").length).toBeGreaterThan(0);
    expect(screen.getByText("Recent Workout Completions")).toBeInTheDocument();
  });
});

describe("TrainingProgramsPage", () => {
  it("switches between active programs and master templates", () => {
    render(createElement(TrainingProgramsPage));

    expect(screen.getByRole("heading", { level: 1, name: "Program Library" })).toBeInTheDocument();
    expect(screen.getByText("Hypertrophy Phase II")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "Master Templates" }));

    expect(screen.getByRole("tabpanel", { name: "Master Templates" })).toHaveTextContent("Body Recomp v3");
    expect(screen.queryByText("Hypertrophy Phase II")).not.toBeInTheDocument();
  });
});

describe("ExerciseDatabasePage", () => {
  it("searches exercises by name", () => {
    render(createElement(ExerciseDatabasePage));

    fireEvent.change(screen.getByRole("searchbox", { name: /search exercises/i }), {
      target: { value: "squat" }
    });

    expect(screen.getByText("High-Bar Back Squat")).toBeInTheDocument();
    expect(screen.queryByText("Incline DB Press")).not.toBeInTheDocument();
  });

  it("filters exercises by category", () => {
    render(createElement(ExerciseDatabasePage));

    fireEvent.click(screen.getByRole("button", { name: "Back" }));

    const grid = screen.getByRole("region", { name: "Exercise grid" });
    expect(within(grid).getByText("Wide-Grip Pull-Ups")).toBeInTheDocument();
    expect(within(grid).queryByText("High-Bar Back Squat")).not.toBeInTheDocument();
  });
});

describe("AddExercisePage", () => {
  it("updates local exercise details and coaching cues", () => {
    render(createElement(AddExercisePage));

    expect(screen.getByRole("heading", { level: 1, name: "Add New Exercise" })).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Exercise Name"), {
      target: { value: "Tempo Goblet Squat" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Decrease sets" }));
    fireEvent.change(screen.getByLabelText("New coaching cue"), {
      target: { value: "Brace before each rep" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Add coaching cue" }));

    expect(screen.getByDisplayValue("Tempo Goblet Squat")).toBeInTheDocument();
    expect(screen.getAllByText("2").length).toBeGreaterThan(0);
    expect(screen.getByText("Brace before each rep")).toBeInTheDocument();
  });

  it("toggles anatomical target pills", () => {
    render(createElement(AddExercisePage));

    fireEvent.click(screen.getByRole("button", { name: "Back" }));

    expect(screen.getByRole("button", { name: "Back" })).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(screen.getByRole("button", { name: "Chest" }));
    expect(screen.getByRole("button", { name: "Chest" })).toHaveAttribute("aria-pressed", "false");
  });
});
