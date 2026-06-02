import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  EducationResourceAssignmentStatus,
  EducationResourceType,
  EducationResourceVisibility
} from "@/app/generated/prisma/enums";
import {
  GET as getEducationResources,
  POST as createEducationResource
} from "@/app/api/v1/education-resources/route";
import {
  GET as getEducationResource,
  PATCH as updateEducationResource
} from "@/app/api/v1/education-resources/[resourceId]/route";
import { POST as assignEducationResource } from "@/app/api/v1/education-resources/[resourceId]/assignments/route";
import {
  createEducationResourceSchema,
  serializeEducationAssignment,
  updateEducationResourceSchema
} from "@/lib/education/education-records";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  prisma: {
    auditLog: { create: vi.fn() },
    educationResource: {
      create: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn()
    },
    educationResourceAssignment: {
      create: vi.fn()
    },
    client: {
      findFirst: vi.fn()
    }
  }
}));

vi.mock("@/auth", () => ({
  auth: mocks.auth
}));

vi.mock("@/lib/db/prisma", () => ({
  prisma: mocks.prisma
}));

const ownerSession = {
  user: { id: "user_1", email: "coach@example.com" },
  activeOrganization: {
    id: "org_1",
    slug: "complete-coach-demo",
    name: "Complete Coach Demo",
    role: "owner"
  }
};

const assistantSession = {
  ...ownerSession,
  activeOrganization: {
    ...ownerSession.activeOrganization,
    role: "assistant"
  }
};

const educationResource = {
  id: "resource_1",
  organizationId: "org_1",
  title: "Recovery Basics",
  description: "Sleep and recovery education.",
  category: "Recovery",
  resourceType: EducationResourceType.ARTICLE,
  objectId: null,
  externalUrl: "https://example.test/recovery",
  tags: ["sleep"],
  visibility: EducationResourceVisibility.PRIVATE,
  createdByUserId: "user_1",
  createdAt: new Date("2026-06-02T00:00:00.000Z"),
  updatedAt: new Date("2026-06-02T00:00:00.000Z")
};

const educationAssignment = {
  id: "education_assignment_1",
  organizationId: "org_1",
  resourceId: "resource_1",
  clientId: "client_1",
  assignedByUserId: "user_1",
  status: EducationResourceAssignmentStatus.ASSIGNED,
  assignedAt: new Date("2026-06-02T00:00:00.000Z"),
  completedAt: null,
  createdAt: new Date("2026-06-02T00:00:00.000Z"),
  updatedAt: new Date("2026-06-02T00:00:00.000Z"),
  client: {
    firstName: "Api",
    lastName: "Client"
  }
};

describe("education resource persistence APIs", () => {
  beforeEach(() => {
    mocks.auth.mockReset();
    mocks.auth.mockResolvedValue(ownerSession);
    mocks.prisma.auditLog.create.mockReset();
    mocks.prisma.educationResource.create.mockReset();
    mocks.prisma.educationResource.findMany.mockReset();
    mocks.prisma.educationResource.findFirst.mockReset();
    mocks.prisma.educationResource.update.mockReset();
    mocks.prisma.educationResourceAssignment.create.mockReset();
    mocks.prisma.client.findFirst.mockReset();
  });

  it("lists active organization education resources", async () => {
    mocks.prisma.educationResource.findMany.mockResolvedValue([educationResource]);

    const response = await getEducationResources(
      new Request("http://test.local/api/v1/education-resources?category=Recovery")
    );
    const payload = (await response.json()) as { data: Array<{ id: string; resourceType: string }> };

    expect(response.status).toBe(200);
    expect(payload.data).toEqual([expect.objectContaining({ id: "resource_1", resourceType: "article" })]);
    expect(mocks.prisma.educationResource.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          organizationId: "org_1",
          deletedAt: null,
          category: "Recovery"
        })
      })
    );
  });

  it("creates education resources and audits without leaking body content", async () => {
    mocks.prisma.educationResource.create.mockResolvedValue(educationResource);

    const response = await createEducationResource(
      new Request("http://test.local/api/v1/education-resources", {
        method: "POST",
        body: JSON.stringify({
          title: "Recovery Basics",
          description: "Sleep and recovery education.",
          category: "Recovery",
          resourceType: "article",
          externalUrl: "https://example.test/recovery",
          tags: ["sleep"]
        })
      })
    );
    const payload = (await response.json()) as { data: { id: string; externalUrl: string } };

    expect(response.status).toBe(201);
    expect(payload.data).toEqual(expect.objectContaining({ id: "resource_1" }));
    expect(mocks.prisma.educationResource.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          organizationId: "org_1",
          createdByUserId: "user_1",
          resourceType: EducationResourceType.ARTICLE
        })
      })
    );
    expect(mocks.prisma.auditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          action: "education_resource.created",
          metadata: { category: "Recovery", resourceType: "article" }
        })
      })
    );
  });

  it("reads and updates one tenant-scoped resource", async () => {
    mocks.prisma.educationResource.findFirst.mockResolvedValue(educationResource);
    mocks.prisma.educationResource.update.mockResolvedValue({
      ...educationResource,
      title: "Updated Recovery Basics"
    });

    const readResponse = await getEducationResource(new Request("http://test.local/api/v1/education-resources/resource_1"), {
      params: Promise.resolve({ resourceId: "resource_1" })
    });
    const updateResponse = await updateEducationResource(
      new Request("http://test.local/api/v1/education-resources/resource_1", {
        method: "PATCH",
        body: JSON.stringify({ title: "Updated Recovery Basics" })
      }),
      { params: Promise.resolve({ resourceId: "resource_1" }) }
    );
    const payload = (await updateResponse.json()) as { data: { title: string } };

    expect(readResponse.status).toBe(200);
    expect(updateResponse.status).toBe(200);
    expect(payload.data.title).toBe("Updated Recovery Basics");
    expect(mocks.prisma.educationResource.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id: "resource_1", organizationId: "org_1" })
      })
    );
  });

  it("assigns resources to active organization clients", async () => {
    mocks.prisma.educationResource.findFirst.mockResolvedValue(educationResource);
    mocks.prisma.client.findFirst.mockResolvedValue({ id: "client_1" });
    mocks.prisma.educationResourceAssignment.create.mockResolvedValue(educationAssignment);

    const response = await assignEducationResource(
      new Request("http://test.local/api/v1/education-resources/resource_1/assignments", {
        method: "POST",
        body: JSON.stringify({ clientId: "client_1" })
      }),
      { params: Promise.resolve({ resourceId: "resource_1" }) }
    );
    const payload = (await response.json()) as { data: { id: string; clientName: string } };

    expect(response.status).toBe(201);
    expect(payload.data).toEqual(expect.objectContaining({ id: "education_assignment_1", clientName: "Api Client" }));
    expect(mocks.prisma.educationResourceAssignment.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          organizationId: "org_1",
          resourceId: "resource_1",
          clientId: "client_1",
          assignedByUserId: "user_1"
        },
        include: expect.any(Object)
      })
    );
  });

  it("returns not found when assigning missing resources or clients", async () => {
    mocks.prisma.educationResource.findFirst.mockResolvedValue(null);
    mocks.prisma.client.findFirst.mockResolvedValue({ id: "client_1" });

    const missingResourceResponse = await assignEducationResource(
      new Request("http://test.local/api/v1/education-resources/missing/assignments", {
        method: "POST",
        body: JSON.stringify({ clientId: "client_1" })
      }),
      { params: Promise.resolve({ resourceId: "missing" }) }
    );

    mocks.prisma.educationResource.findFirst.mockResolvedValue(educationResource);
    mocks.prisma.client.findFirst.mockResolvedValue(null);

    const missingClientResponse = await assignEducationResource(
      new Request("http://test.local/api/v1/education-resources/resource_1/assignments", {
        method: "POST",
        body: JSON.stringify({ clientId: "missing" })
      }),
      { params: Promise.resolve({ resourceId: "resource_1" }) }
    );

    expect(missingResourceResponse.status).toBe(404);
    expect(missingClientResponse.status).toBe(404);
    expect(mocks.prisma.educationResourceAssignment.create).not.toHaveBeenCalled();
  });

  it("rejects education writes for read-only assistants", async () => {
    mocks.auth.mockResolvedValue(assistantSession);

    const response = await createEducationResource(
      new Request("http://test.local/api/v1/education-resources", {
        method: "POST",
        body: JSON.stringify({
          title: "Recovery Basics",
          category: "Recovery",
          resourceType: "link",
          externalUrl: "https://example.test/recovery"
        })
      })
    );

    expect(response.status).toBe(403);
    expect(mocks.prisma.educationResource.create).not.toHaveBeenCalled();
  });

  it("validates file-backed resources require an object id or external URL", async () => {
    const response = await createEducationResource(
      new Request("http://test.local/api/v1/education-resources", {
        method: "POST",
        body: JSON.stringify({
          title: "Recovery PDF",
          category: "Recovery",
          resourceType: "pdf"
        })
      })
    );

    expect(response.status).toBe(422);
    expect(mocks.prisma.educationResource.create).not.toHaveBeenCalled();
  });

  it("covers education helper branches for link validation and nullable assignment fields", () => {
    expect(() =>
      createEducationResourceSchema.parse({
        title: "Missing link",
        category: "Recovery",
        resourceType: "link"
      })
    ).toThrow(/external URL/);
    expect(
      updateEducationResourceSchema.parse({
        resourceType: "pdf",
        objectId: "organizations/org_1/education/resources/recovery.pdf"
      })
    ).toEqual({
      resourceType: "pdf",
      objectId: "organizations/org_1/education/resources/recovery.pdf",
      visibility: "private"
    });
    expect(
      serializeEducationAssignment({
        ...educationAssignment,
        client: undefined,
        completedAt: new Date("2026-06-03T00:00:00.000Z")
      })
    ).toEqual(expect.objectContaining({ clientName: null, completedAt: "2026-06-03T00:00:00.000Z" }));
  });
});
