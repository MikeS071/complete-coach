import { randomUUID } from "node:crypto";

import { z } from "zod";

const allowedAttachmentContentTypes = {
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp"
} as const;

const maxAttachmentBytes = 25 * 1024 * 1024;

export const messageAttachmentUploadSchema = z
  .object({
    filename: z.string().trim().min(1).max(180),
    contentType: z.string().trim().min(1).max(120),
    byteSize: z.number().int().min(1),
    checksumSha256: z.string().regex(/^[a-f0-9]{64}$/i).optional()
  })
  .superRefine((input, context) => {
    const extension = getExtension(input.filename);
    const expectedExtension =
      allowedAttachmentContentTypes[input.contentType as keyof typeof allowedAttachmentContentTypes];

    if (!(input.contentType in allowedAttachmentContentTypes)) {
      context.addIssue({
        code: "custom",
        path: ["contentType"],
        message: "Unsupported message attachment content type."
      });
    }

    if (input.byteSize > maxAttachmentBytes) {
      context.addIssue({
        code: "custom",
        path: ["byteSize"],
        message: "Message attachment exceeds the maximum allowed size."
      });
    }

    if (!extension || extension !== expectedExtension) {
      context.addIssue({
        code: "custom",
        path: ["filename"],
        message: "File extension does not match the attachment content type."
      });
    }
  });

export type MessageAttachmentUploadInput = z.infer<typeof messageAttachmentUploadSchema>;

export function buildMessageAttachmentObjectKey(organizationId: string, input: MessageAttachmentUploadInput) {
  const extension =
    allowedAttachmentContentTypes[input.contentType as keyof typeof allowedAttachmentContentTypes];

  return `organizations/${organizationId}/messages/attachments/${randomUUID()}.${extension}`;
}

export function getMessageAttachmentMaxBytes() {
  return maxAttachmentBytes;
}

export function validateMessageAttachmentObjectKeys(organizationId: string, objectKeys: string[]) {
  objectKeys.forEach((objectKey) => validateMessageAttachmentObjectKey(organizationId, objectKey));
}

export function validateMessageAttachmentObjectKey(organizationId: string, objectKey: string) {
  const escapedOrganizationId = escapeRegExp(organizationId);
  const allowedExtensions = Object.values(allowedAttachmentContentTypes).join("|");
  const pattern = new RegExp(
    `^organizations/${escapedOrganizationId}/messages/attachments/[0-9a-fA-F-]{36}\\.(${allowedExtensions})$`
  );

  if (!pattern.test(objectKey)) {
    throw new Error("Invalid message attachment object key for active organization.");
  }
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
