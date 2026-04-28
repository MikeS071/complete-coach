"use client";

import { useState } from "react";

import { FormBuilder } from "./form-builder";
import { FormManagement } from "./form-management";

export function FormsPage() {
  const [currentView, setCurrentView] = useState<"management" | "builder">("management");
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);

  const handleCreateForm = (templateType?: string) => {
    setCurrentView("builder");
    setSelectedFormId(templateType ?? "new");
  };

  return currentView === "management" ? (
    <FormManagement onCreateForm={handleCreateForm} />
  ) : (
    <FormBuilder formId={selectedFormId} onBack={() => setCurrentView("management")} />
  );
}
