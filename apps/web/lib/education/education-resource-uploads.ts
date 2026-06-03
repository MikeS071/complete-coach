import { randomUUID } from "node:crypto";

import { z } from "zod";

import { educationResourceTypeValues } from "@/lib/education/education-records";

const allowedEducationContentTypes = {
  "application/pdf": { extension: "pdf", resourceType: "pdf", maxBytes: 50 * 1024 * 1024 },
  "image/jpeg": { extension: "jpg", resourceType: "file", maxBytes: 25 * 1024 * 1024 },
  "image/png": { extension: "png", resourceType: "file", maxBytes: 25 * 1024 * 1024 },
  "image/webp": { extension: "webp", resourceType: "file", maxBytes: 25 * 1024 * 1024 },
  "video/mp4": { extension: "mp4", resourceType: "video", maxBytes: 500 * 1024 * 1024 },
  "video/quicktime": { extension: "mov", resourceType: "video", maxBytes: 500 * 1024 * 1024 },
  "video/webm": { extension: "webm", resourceType: "video", maxBytes: 500 * 1024 * 1024 }
} as const;

type AllowedEducationContentType = keyof typeof allowedEducationContentTypes;

export const educationResourceUploadSchema = z
  .object({
    filename: z.string().trim().min(1).max(180),
    contentType: z.string().trim().min(1).max(120),
    byteSize: z.number().int().min(1),
    checksumSha256: z.string().regex(/^[a-f0-9]{64}$/i).optional()
  })
  .superRefine((input, context) => {
    const uploadType = getEducationUploadType(input.contentType);
    const extension = getExtension(input.filename);

    if (!uploadType) {
      context.addIssue({
        code: "custom",
        path: ["contentType"],
        message: "Unsupported education resource content type."
      });

      return;
    }

    if (input.byteSize > uploadType.maxBytes) {
      context.addIssue({
        code: "custom",
        path: ["byteSize"],
        message: "Education resource exceeds the maximum allowed size."
      });
    }

    if (!extension || extension !== uploadType.extension) {
      context.addIssue({
        code: "custom",
        path: ["filename"],
        message: "File extension does not match the education resource content type."
      });
    }
  });

export type EducationResourceUploadInput = z.infer<typeof educationResourceUploadSchema>;
export type EducationResourceUploadType = (typeof educationResourceTypeValues)[number];

export function buildEducationResourceObjectKey(organizationId: string, input: EducationResourceUploadInput) {
  const uploadType = getRequiredEducationUploadType(input.contentType);

  return `organizations/${organizationId}/education/resources/${uploadType.resourceType}/${randomUUID()}.${uploadType.extension}`;
}

export function getEducationResourceMaxBytes(contentType: string) {
  return getRequiredEducationUploadType(contentType).maxBytes;
}

export function getEducationResourceTypeForContentType(contentType: string): EducationResourceUploadType {
  return getRequiredEducationUploadType(contentType).resourceType;
}

export function validateEducationResourceObjectKey(organizationId: string, objectKey: string) {
  const escapedOrganizationId = escapeRegExp(organizationId);
  const allowedExtensions = Object.values(allowedEducationContentTypes)
    .map((uploadType) => uploadType.extension)
    .join("|");
  const pattern = new RegExp(
    `^organizations/${escapedOrganizationId}/education/resources/(pdf|video|file)/[0-9a-fA-F-]{36}\\.(${allowedExtensions})$`
  );

  if (!pattern.test(objectKey)) {
    throw new Error("Invalid education resource object key for active organization.");
  }
}

function getRequiredEducationUploadType(contentType: string) {
  const uploadType = getEducationUploadType(contentType);

  if (!uploadType) {
    throw new Error("Unsupported education resource content type.");
  }

  return uploadType;
}

function getEducationUploadType(contentType: string) {
  return allowedEducationContentTypes[contentType as AllowedEducationContentType];
}

function getExtension(filename: string) {
  const extension = filename.toLowerCase().match(/\.([a-z0-9]+)$/)?.[1];

  if (extension === "jpeg") {
    return "jpg";
  }

  return extension;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
