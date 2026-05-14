"use client";

import { useEffect, useState } from "react";

import { FormBuilder } from "./form-builder";
import { FormManagement } from "./form-management";

export interface PersistedFormSummary {
  id: string;
  name: string;
  description: string | null;
  type: "check-in" | "intake" | "application" | "contact" | "habit-tracker";
  status: "draft" | "published" | "archived";
  currentVersionId: string | null;
  createdAt: string;
  updatedAt: string;
}

type FormsSource = "api" | "fixture";

export function FormsPage() {
  const [currentView, setCurrentView] = useState<"management" | "builder">("management");
  const [selectedTemplateType, setSelectedTemplateType] = useState<string | null>(null);
  const [selectedForm, setSelectedForm] = useState<PersistedFormSummary | null>(null);
  const [forms, setForms] = useState<PersistedFormSummary[]>([]);
  const [formsSource, setFormsSource] = useState<FormsSource>("fixture");
  const [loadingForms, setLoadingForms] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadForms() {
      try {
        const response = await fetch("/api/v1/forms?limit=20");

        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as { data?: PersistedFormSummary[] };

        if (active) {
          setForms(payload.data ?? []);
          setFormsSource("api");
        }
      } catch {
        // Keep the fixture-backed preview usable when migrations or auth are unavailable.
      } finally {
        if (active) {
          setLoadingForms(false);
        }
      }
    }

    void loadForms();

    return () => {
      active = false;
    };
  }, []);

  const handleCreateForm = (templateType?: string) => {
    setSelectedForm(null);
    setSelectedTemplateType(templateType ?? null);
    setCurrentView("builder");
  };

  const handleEditForm = (form: PersistedFormSummary) => {
    setSelectedForm(form);
    setSelectedTemplateType(form.type);
    setCurrentView("builder");
  };

  const upsertForm = (form: PersistedFormSummary) => {
    setFormsSource("api");
    setForms((currentForms) => {
      const existingIndex = currentForms.findIndex((currentForm) => currentForm.id === form.id);

      if (existingIndex === -1) {
        return [form, ...currentForms];
      }

      const nextForms = [...currentForms];
      nextForms[existingIndex] = form;
      return nextForms;
    });
  };

  return currentView === "management" ? (
    <FormManagement
      forms={forms}
      formsSource={formsSource}
      loadingForms={loadingForms}
      onCreateForm={handleCreateForm}
      onEditForm={handleEditForm}
    />
  ) : (
    <FormBuilder
      form={selectedForm}
      templateType={selectedTemplateType}
      onBack={() => setCurrentView("management")}
      onPersistedForm={upsertForm}
    />
  );
}
