import { render, screen } from "@testing-library/react";
import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/components/ui/utils";

describe("UI primitives", () => {
  it("renders the design-system button with an accessible name", () => {
    render(createElement(Button, null, "Start Task"));

    expect(screen.getByRole("button", { name: "Start Task" })).toBeInTheDocument();
  });

  it("supports composition through asChild slots", () => {
    render(
      createElement(
        "div",
        null,
        createElement(Button, { asChild: true }, createElement("a", { href: "/clients" }, "View Clients")),
        createElement(Badge, { asChild: true }, createElement("span", null, "Elite"))
      )
    );

    expect(screen.getByRole("link", { name: "View Clients" })).toHaveAttribute("href", "/clients");
    expect(screen.getByText("Elite")).toHaveAttribute("data-slot", "badge");
  });

  it("renders form controls with accessible labels", () => {
    render(
      createElement(
        "label",
        null,
        "Search clients",
        createElement(Input, { name: "search", type: "search" })
      )
    );

    expect(screen.getByRole("searchbox", { name: "Search clients" })).toBeInTheDocument();
  });

  it("renders card and badge primitives with design slots", () => {
    render(
      createElement(
        Card,
        null,
        createElement(
          CardHeader,
          null,
          createElement(CardTitle, null, "Client Capacity"),
          createElement(CardDescription, null, "Room for more athletes"),
          createElement(CardAction, null, createElement(Badge, { variant: "secondary" }, "50% Load"))
        ),
        createElement(CardContent, null, "42 / 84"),
        createElement(CardFooter, null, "Updated today")
      )
    );

    expect(screen.getByText("Client Capacity")).toBeInTheDocument();
    expect(screen.getByText("Room for more athletes")).toBeInTheDocument();
    expect(screen.getByText("50% Load")).toBeInTheDocument();
    expect(screen.getByText("42 / 84")).toBeInTheDocument();
    expect(screen.getByText("Updated today")).toBeInTheDocument();
  });

  it("renders an accessible dialog when opened", () => {
    render(
      createElement(
        Dialog,
        { open: true },
        createElement(
          DialogContent,
          null,
          createElement(
            DialogHeader,
            null,
            createElement(DialogTitle, null, "New Protocol"),
            createElement(DialogDescription, null, "Add supplement to library")
          ),
          createElement(DialogFooter, null, createElement(DialogClose, null, "Cancel"))
        )
      )
    );

    expect(screen.getByRole("dialog", { name: "New Protocol" })).toBeInTheDocument();
    expect(screen.getByText("Add supplement to library")).toBeInTheDocument();
  });

  it("renders dialog trigger and close controls", () => {
    render(
      createElement(
        Dialog,
        null,
        createElement(DialogTrigger, null, "Open Protocol"),
        createElement(
          DialogContent,
          null,
          createElement(DialogTitle, null, "Protocol Details"),
          createElement(DialogClose, null, "Close Protocol")
        )
      )
    );

    expect(screen.getByRole("button", { name: "Open Protocol" })).toBeInTheDocument();
  });

  it("merges Tailwind classes predictably", () => {
    const shouldHide = Boolean("");

    expect(cn("px-2", "px-4", shouldHide && "hidden")).toBe("px-4");
  });
});
