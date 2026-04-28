import { ArrowLeft, Bell, Eye, Grip, Image, Search, Send, Settings, Trash2 } from "lucide-react";
import { useState } from "react";

import { formElements, getTemplateName, initialFormFields, type FormField } from "@/fixtures/forms";
import { cn } from "@/lib/utils";

interface FormBuilderProps {
  formId: string | null;
  onBack: () => void;
}

const colorOptions = [
  { value: "#6366f1", label: "Indigo" },
  { value: "#f97316", label: "Orange" },
  { value: "#10b981", label: "Green" },
  { value: "#1f2937", label: "Dark" }
];

export function FormBuilder({ formId, onBack }: FormBuilderProps) {
  const [fields, setFields] = useState<FormField[]>(initialFormFields);
  const [primaryColor, setPrimaryColor] = useState("#6366f1");
  const [successMessage, setSuccessMessage] = useState(
    "Thanks for applying! Our elite performance team will review your application within 24 hours."
  );
  const templateName = getTemplateName(formId);

  const addField = (elementType: string) => {
    const newField: FormField = {
      id: `field-${fields.length + 1}-${elementType}`,
      type: elementType,
      label: `New ${elementType.replaceAll("-", " ")} field`,
      placeholder: "",
      required: false,
      options: elementType === "multiple-choice" ? ["Option 1"] : undefined
    };

    setFields((currentFields) => [...currentFields, newField]);
  };

  const removeField = (fieldId: string) => {
    setFields((currentFields) => currentFields.filter((field) => field.id !== fieldId));
  };

  const moveField = (fieldId: string, direction: "up" | "down") => {
    setFields((currentFields) => {
      const index = currentFields.findIndex((field) => field.id === fieldId);
      const nextIndex = direction === "up" ? index - 1 : index + 1;

      if (index < 0 || nextIndex < 0 || nextIndex >= currentFields.length) {
        return currentFields;
      }

      const updatedFields = [...currentFields];
      const [movedField] = updatedFields.splice(index, 1);
      updatedFields.splice(nextIndex, 0, movedField);

      return updatedFields;
    });
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3">
        <div className="flex items-center gap-4">
          <button
            type="button"
            aria-label="Back to forms"
            className="rounded-lg p-2 transition-colors hover:bg-gray-100"
            onClick={onBack}
          >
            <ArrowLeft className="size-5 text-gray-600" aria-hidden="true" />
          </button>
          <div>
            <h1 className="text-lg font-bold">Form Builder</h1>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>Drafts</span>
              <span>/</span>
              <span className="text-indigo-600">{templateName}</span>
            </div>
          </div>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
            <input
              type="search"
              aria-label="Search components"
              placeholder="Search components..."
              className="w-64 rounded-lg border border-gray-200 py-1.5 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button type="button" aria-label="Builder notifications" className="rounded-lg p-2 transition-colors hover:bg-gray-100">
            <Bell className="size-5 text-gray-600" aria-hidden="true" />
          </button>
          <button type="button" aria-label="Builder settings" className="rounded-lg p-2 transition-colors hover:bg-gray-100">
            <Settings className="size-5 text-gray-600" aria-hidden="true" />
          </button>
          <button className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700">
            Save Changes
          </button>
        </div>
      </header>

      <div className="grid flex-1 lg:grid-cols-[16rem_1fr_20rem]">
        <aside className="border-r border-gray-200 bg-white p-4">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">Form Elements</h2>
          <div className="space-y-2">
            {formElements.map((element) => {
              const Icon = element.icon;

              return (
                <button
                  key={element.id}
                  type="button"
                  aria-label={`Add ${element.label} field`}
                  className={cn("flex w-full items-center gap-3 rounded-lg p-3 transition-opacity hover:opacity-80", element.color)}
                  onClick={() => addField(element.id)}
                >
                  <Icon className="size-4" aria-hidden="true" />
                  <span className="text-sm font-medium">{element.label}</span>
                </button>
              );
            })}
          </div>
        </aside>

        <main className="overflow-y-auto p-6 md:p-8">
          <section className="mx-auto max-w-2xl" aria-label="Form preview">
            <div className="overflow-hidden rounded-2xl bg-white shadow-lg">
              <div className="flex h-48 items-center justify-center bg-gradient-to-br from-slate-950 to-indigo-700 text-white">
                <Image className="size-10 opacity-80" aria-hidden="true" />
              </div>
              <div className="p-8">
                <h2 className="mb-2 text-3xl font-bold">New Client Intake</h2>
                <p className="mb-8 text-gray-600">Please provide your details for coach review.</p>

                <div className="space-y-6">
                  {fields.map((field, index) => (
                    <FormFieldEditor
                      key={field.id}
                      field={field}
                      index={index}
                      fieldCount={fields.length}
                      primaryColor={primaryColor}
                      onMove={moveField}
                      onRemove={removeField}
                    />
                  ))}

                  <div className="rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
                    <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-gray-100">
                      <Grip className="size-6 text-gray-400" aria-hidden="true" />
                    </div>
                    <p className="mb-1 text-sm font-medium text-gray-500">Drag and drop elements here to build your form</p>
                    <p className="text-xs text-gray-400">Or click on elements from the left sidebar</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        <aside className="border-l border-gray-200 bg-white p-5">
          <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-gray-500">Global Settings</h2>

          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-700">Primary Color</label>
            <div className="flex gap-2">
              {colorOptions.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  aria-label={`Set primary color ${color.label}`}
                  className={cn("size-10 rounded-lg border-2 transition-all", primaryColor === color.value ? "scale-110 border-gray-900" : "border-gray-200")}
                  style={{ backgroundColor: color.value }}
                  onClick={() => setPrimaryColor(color.value)}
                />
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="success-message" className="mb-2 block text-sm font-medium text-gray-700">
              Success Message
            </label>
            <textarea
              id="success-message"
              value={successMessage}
              rows={4}
              className="w-full resize-none rounded-lg border border-gray-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              onChange={(event) => setSuccessMessage(event.target.value)}
            />
          </div>

          <div className="space-y-3 border-t border-gray-200 pt-4">
            <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-100 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200">
              <Eye className="size-4" aria-hidden="true" />
              Preview Form
            </button>
            <button
              className="flex w-full items-center justify-center gap-2 rounded-lg py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: primaryColor }}
            >
              <Send className="size-4" aria-hidden="true" />
              Publish Form
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

function FormFieldEditor({
  field,
  index,
  fieldCount,
  primaryColor,
  onMove,
  onRemove
}: {
  field: FormField;
  index: number;
  fieldCount: number;
  primaryColor: string;
  onMove: (fieldId: string, direction: "up" | "down") => void;
  onRemove: (fieldId: string) => void;
}) {
  return (
    <div data-testid="form-field" className="rounded-xl border border-gray-200 p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-900">{field.label}</label>
          <p className="text-xs uppercase tracking-wider text-gray-500">{field.type}</p>
        </div>
        <div className="flex gap-1">
          <button
            type="button"
            aria-label={`Move ${field.label} up`}
            disabled={index === 0}
            className="rounded px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 disabled:opacity-40"
            onClick={() => onMove(field.id, "up")}
          >
            Up
          </button>
          <button
            type="button"
            aria-label={`Move ${field.label} down`}
            disabled={index === fieldCount - 1}
            className="rounded px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 disabled:opacity-40"
            onClick={() => onMove(field.id, "down")}
          >
            Down
          </button>
          <button
            type="button"
            aria-label={`Remove ${field.label}`}
            className="rounded p-1 text-red-500 hover:bg-red-50"
            onClick={() => onRemove(field.id)}
          >
            <Trash2 className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>
      <input
        disabled
        placeholder={field.placeholder || "Client response"}
        className="w-full rounded-lg border border-gray-200 p-3 text-sm"
        style={{ accentColor: primaryColor }}
      />
    </div>
  );
}
