import { z } from "zod";
import type { InputJsonValue } from "@prisma/client/runtime/client";

import {
  EducationResourceAssignmentStatus,
  EducationResourceType,
  EducationResourceVisibility
} from "@/app/generated/prisma/enums";

export const educationResourceTypeValues = ["article", "video", "pdf", "link", "file"] as const;
export const educationVisibilityValues = ["private", "assigned"] as const;
export const educationAssignmentStatusValues = ["assigned", "viewed", "completed", "cancelled"] as const;

type EducationResourceTypeValue = (typeof educationResourceTypeValues)[number];
type EducationVisibilityValue = (typeof educationVisibilityValues)[number];

const resourceTypeToPrisma: Record<EducationResourceTypeValue, EducationResourceType> = {
  article: EducationResourceType.ARTICLE,
  video: EducationResourceType.VIDEO,
  pdf: EducationResourceType.PDF,
  link: EducationResourceType.LINK,
  file: EducationResourceType.FILE
};

const resourceTypeFromPrisma: Record<EducationResourceType, EducationResourceTypeValue> = {
  [EducationResourceType.ARTICLE]: "article",
  [EducationResourceType.VIDEO]: "video",
  [EducationResourceType.PDF]: "pdf",
  [EducationResourceType.LINK]: "link",
  [EducationResourceType.FILE]: "file"
};

const visibilityToPrisma: Record<EducationVisibilityValue, EducationResourceVisibility> = {
  private: EducationResourceVisibility.PRIVATE,
  assigned: EducationResourceVisibility.ASSIGNED
};

const visibilityFromPrisma: Record<EducationResourceVisibility, EducationVisibilityValue> = {
  [EducationResourceVisibility.PRIVATE]: "private",
  [EducationResourceVisibility.ASSIGNED]: "assigned"
};

const assignmentStatusFromPrisma: Record<
  EducationResourceAssignmentStatus,
  (typeof educationAssignmentStatusValues)[number]
> = {
  [EducationResourceAssignmentStatus.ASSIGNED]: "assigned",
  [EducationResourceAssignmentStatus.VIEWED]: "viewed",
  [EducationResourceAssignmentStatus.COMPLETED]: "completed",
  [EducationResourceAssignmentStatus.CANCELLED]: "cancelled"
};

const tagsSchema = z.array(z.string().trim().min(1).max(80)).max(20);

export const educationResourceListQuerySchema = z.object({
  category: z.string().trim().max(80).optional(),
  resourceType: z.enum(educationResourceTypeValues).optional(),
  search: z.string().trim().max(100).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50)
});

const educationResourceFields = {
  title: z.string().trim().min(1).max(180),
  description: z.string().trim().max(4000).optional(),
  category: z.string().trim().min(1).max(80),
  resourceType: z.enum(educationResourceTypeValues),
  objectId: z.string().trim().max(500).optional(),
  externalUrl: z.string().trim().url().max(1000).optional(),
  tags: tagsSchema.optional(),
  visibility: z.enum(educationVisibilityValues).default("private")
};

export const createEducationResourceSchema = z
  .object(educationResourceFields)
  .superRefine(validateResourceLocation);

export const updateEducationResourceSchema = z
  .object(educationResourceFields)
  .partial()
  .refine((input) => Object.keys(input).length > 0, { message: "At least one field is required." })
  .superRefine(validateResourceLocation);

export const createEducationAssignmentSchema = z.object({
  clientId: z.string().min(1)
});

type EducationResourceListQuery = z.infer<typeof educationResourceListQuerySchema>;
type CreateEducationResourceInput = z.infer<typeof createEducationResourceSchema>;
type UpdateEducationResourceInput = z.infer<typeof updateEducationResourceSchema>;

interface EducationResourceRecord {
  id: string;
  organizationId: string;
  title: string;
  description: string | null;
  category: string;
  resourceType: EducationResourceType;
  objectId: string | null;
  externalUrl: string | null;
  tags: unknown;
  visibility: EducationResourceVisibility;
  createdByUserId: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

interface EducationAssignmentRecord {
  id: string;
  organizationId: string;
  resourceId: string;
  clientId: string;
  assignedByUserId: string | null;
  status: EducationResourceAssignmentStatus;
  assignedAt: Date | string;
  completedAt: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  client?: { firstName: string; lastName: string };
}

export function buildEducationResourceWhere(organizationId: string, query: EducationResourceListQuery) {
  return {
    organizationId,
    deletedAt: null,
    ...(query.category ? { category: query.category } : {}),
    ...(query.resourceType ? { resourceType: resourceTypeToPrisma[query.resourceType] } : {}),
    ...(query.search
      ? {
          OR: [
            { title: { contains: query.search, mode: "insensitive" as const } },
            { category: { contains: query.search, mode: "insensitive" as const } },
            { description: { contains: query.search, mode: "insensitive" as const } }
          ]
        }
      : {})
  };
}

export function getEducationResourceCreateData(
  organizationId: string,
  userId: string,
  input: CreateEducationResourceInput
) {
  return {
    organizationId,
    createdByUserId: userId,
    title: input.title,
    description: input.description,
    category: input.category,
    resourceType: resourceTypeToPrisma[input.resourceType],
    objectId: input.objectId,
    externalUrl: input.externalUrl,
    tags: input.tags as InputJsonValue | undefined,
    visibility: visibilityToPrisma[input.visibility]
  };
}

export function getEducationResourceUpdateData(input: UpdateEducationResourceInput) {
  return {
    ...(input.title ? { title: input.title } : {}),
    ...(input.description !== undefined ? { description: input.description } : {}),
    ...(input.category ? { category: input.category } : {}),
    ...(input.resourceType ? { resourceType: resourceTypeToPrisma[input.resourceType] } : {}),
    ...(input.objectId !== undefined ? { objectId: input.objectId } : {}),
    ...(input.externalUrl !== undefined ? { externalUrl: input.externalUrl } : {}),
    ...(input.tags !== undefined ? { tags: input.tags as InputJsonValue } : {}),
    ...(input.visibility ? { visibility: visibilityToPrisma[input.visibility] } : {})
  };
}

export function serializeEducationResource(record: EducationResourceRecord) {
  return {
    id: record.id,
    organizationId: record.organizationId,
    title: record.title,
    description: record.description,
    category: record.category,
    resourceType: resourceTypeFromPrisma[record.resourceType],
    objectId: record.objectId,
    externalUrl: record.externalUrl,
    tags: Array.isArray(record.tags) ? record.tags : [],
    visibility: visibilityFromPrisma[record.visibility],
    createdByUserId: record.createdByUserId,
    createdAt: toIsoDate(record.createdAt),
    updatedAt: toIsoDate(record.updatedAt)
  };
}

export function serializeEducationAssignment(record: EducationAssignmentRecord) {
  return {
    id: record.id,
    organizationId: record.organizationId,
    resourceId: record.resourceId,
    clientId: record.clientId,
    clientName: record.client ? `${record.client.firstName} ${record.client.lastName}` : null,
    assignedByUserId: record.assignedByUserId,
    status: assignmentStatusFromPrisma[record.status],
    assignedAt: toIsoDate(record.assignedAt),
    completedAt: record.completedAt ? toIsoDate(record.completedAt) : null,
    createdAt: toIsoDate(record.createdAt),
    updatedAt: toIsoDate(record.updatedAt)
  };
}

function validateResourceLocation(
  input: { resourceType?: EducationResourceTypeValue; objectId?: string; externalUrl?: string },
  context: z.RefinementCtx
) {
  if (input.resourceType === "link" && !input.externalUrl) {
    context.addIssue({ code: "custom", path: ["externalUrl"], message: "Link resources require an external URL." });
  }

  if (input.resourceType && input.resourceType !== "link" && !input.objectId && !input.externalUrl) {
    context.addIssue({
      code: "custom",
      path: ["objectId"],
      message: "File-backed resources require an object id or temporary external URL."
    });
  }
}

function toIsoDate(value: Date | string) {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}
