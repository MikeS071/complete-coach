import type { FormDefinition } from "@/lib/forms/schema";

export interface MeasurementInput {
  clientId: string;
  organizationId: string;
  sourceId: string;
  submittedAt: Date;
  definition: FormDefinition;
  answers: Record<string, unknown>;
}

export interface ExtractedMeasurement {
  clientId: string;
  measuredAt: Date;
  metadata: {
    fieldId: string;
    label: string;
  };
  metricKey: string;
  metricValue: number;
  organizationId: string;
  sourceId: string;
  sourceType: "form_submission";
  unit: string | null;
}

export function extractMeasurementsFromSubmission(input: MeasurementInput): ExtractedMeasurement[] {
  return input.definition.fields.flatMap((field) => {
    if (!field.metricKey) {
      return [];
    }

    const rawValue = input.answers[field.id];

    if (rawValue === undefined || rawValue === null || rawValue === "") {
      return [];
    }

    const metricValue = parseMetricValue(rawValue, field.id);

    return [
      {
        clientId: input.clientId,
        measuredAt: input.submittedAt,
        metadata: {
          fieldId: field.id,
          label: field.label
        },
        metricKey: field.metricKey,
        metricValue,
        organizationId: input.organizationId,
        sourceId: input.sourceId,
        sourceType: "form_submission",
        unit: field.metricUnit ?? null
      }
    ];
  });
}

function parseMetricValue(value: unknown, fieldId: string) {
  const metricValue = typeof value === "number" ? value : Number(value);

  if (!Number.isFinite(metricValue)) {
    throw new Error(`Invalid numeric metric answer for ${fieldId}`);
  }

  return metricValue;
}
