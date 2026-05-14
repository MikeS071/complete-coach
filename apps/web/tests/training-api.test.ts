import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  ExerciseDifficulty,
  LibraryScope,
  TrainingProgramAssignmentStatus,
  TrainingProgramTemplateStatus
} from "@/app/generated/prisma/enums";
import { GET as getExercises, POST as createExercise } from "@/app/api/v1/exercises/route";
import { GET as getExercise, PATCH as updateExercise } from "@/app/api/v1/exercises/[exerciseId]/route";
import {
  GET as getTrainingTemplates,
  POST as createTrainingTemplate
} from "@/app/api/v1/training-program-templates/route";
import {
  GET as getTrainingAssignments,
  POST as createTrainingAssignment
} from "@/app/api/v1/training-program-assignments/route";
import { GET as getClientTrainingPrograms } from "@/app/api/v1/clients/[clientId]/training-programs/route";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  prisma: {
    auditLog: { create: vi.fn() },
    client: { findFirst: vi.fn() },
    exerciseLibraryItem: {
      create: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn()
    },
    trainingProgramTemplate: {
      create: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn()
    },
    trainingProgramAssignment: {
      create: vi.fn(),
      findMany: vi.fn()
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

const globalExercise = {
  id: "exercise_global",
  organizationId: null,
  scope: LibraryScope.GLOBAL,
  name: "High-Bar Back Squat",
  category: "Quads",
  equipment: "Barbell",
  primaryMuscles: ["Quads"],
  secondaryMuscles: ["Glutes"],
  difficulty: ExerciseDifficulty.INTERMEDIATE,
  videoObjectKey: null,
  imageObjectKey: null,
  defaultSets: 4,
  defaultReps: "6-8",
  defaultRestSeconds: 180,
  defaultRpe: 8,
  executionCues: ["Brace hard"],
  createdAt: new Date("2026-05-14T00:00:00.000Z"),
  updatedAt: new Date("2026-05-14T00:00:00.000Z")
};

const privateExercise = {
  ...globalExercise,
  id: "exercise_private",
  organizationId: "org_1",
  scope: LibraryScope.PRIVATE,
  name: "Tempo Split Squat"
};

const templateRecord = {
  id: "template_1",
  organizationId: "org_1",
  name: "Strength Foundation",
  description: "Base strength template",
  goal: "strength",
  durationWeeks: 8,
  status: TrainingProgramTemplateStatus.PUBLISHED,
  templateJson: {
    days: [
      {
        name: "Lower A",
        exercises: [
          {
            exerciseId: "exercise_private",
            exerciseName: "Tempo Split Squat",
            sets: 3,
            reps: "8/side",
            restSeconds: 120
          }
        ]
      }
    ]
  },
  createdAt: new Date("2026-05-14T00:00:00.000Z"),
  updatedAt: new Date("2026-05-14T00:00:00.000Z")
};

const assignmentRecord = {
  id: "assignment_1",
  organizationId: "org_1",
  clientId: "client_1",
  templateId: "template_1",
  name: "Strength Foundation",
  status: TrainingProgramAssignmentStatus.ACTIVE,
  startsOn: new Date("2026-05-14T00:00:00.000Z"),
  endsOn: new Date("2026-07-09T00:00:00.000Z"),
  snapshotJson: {
    templateId: "template_1",
    templateName: "Strength Foundation",
    template: templateRecord.templateJson
  },
  createdAt: new Date("2026-05-14T00:00:00.000Z"),
  updatedAt: new Date("2026-05-14T00:00:00.000Z"),
  client: {
    firstName: "Api",
    lastName: "Client"
  }
};

describe("training persistence APIs", () => {
  beforeEach(() => {
    mocks.auth.mockReset();
    mocks.auth.mockResolvedValue(ownerSession);
    mocks.prisma.auditLog.create.mockReset();
    mocks.prisma.client.findFirst.mockReset();
    mocks.prisma.exerciseLibraryItem.create.mockReset();
    mocks.prisma.exerciseLibraryItem.findMany.mockReset();
    mocks.prisma.exerciseLibraryItem.findFirst.mockReset();
    mocks.prisma.exerciseLibraryItem.update.mockReset();
    mocks.prisma.trainingProgramTemplate.create.mockReset();
    mocks.prisma.trainingProgramTemplate.findMany.mockReset();
    mocks.prisma.trainingProgramTemplate.findFirst.mockReset();
    mocks.prisma.trainingProgramAssignment.create.mockReset();
    mocks.prisma.trainingProgramAssignment.findMany.mockReset();
  });

  it("lists global and tenant private exercises for the active organization", async () => {
    mocks.prisma.exerciseLibraryItem.findMany.mockResolvedValue([globalExercise, privateExercise]);

    const response = await getExercises(new Request("http://test.local/api/v1/exercises?search=squat"));
    const payload = (await response.json()) as { data: Array<{ id: string; scope: string }> };

    expect(response.status).toBe(200);
    expect(payload.data).toEqual([
      expect.objectContaining({ id: "exercise_global", scope: "global" }),
      expect.objectContaining({ id: "exercise_private", scope: "private" })
    ]);
    expect(mocks.prisma.exerciseLibraryItem.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: [{ scope: LibraryScope.GLOBAL }, { organizationId: "org_1" }]
        })
      })
    );
  });

  it("creates private tenant exercises and audit logs the write", async () => {
    mocks.prisma.exerciseLibraryItem.create.mockResolvedValue(privateExercise);

    const response = await createExercise(
      new Request("http://test.local/api/v1/exercises", {
        method: "POST",
        body: JSON.stringify({
          name: "Tempo Split Squat",
          category: "Quads",
          equipment: "Dumbbells",
          primaryMuscles: ["Quads"],
          difficulty: "intermediate",
          defaultSets: 3,
          defaultReps: "8/side",
          executionCues: ["Control the eccentric"]
        })
      })
    );
    const payload = (await response.json()) as { data: { id: string; scope: string } };

    expect(response.status).toBe(201);
    expect(payload.data).toEqual(expect.objectContaining({ id: "exercise_private", scope: "private" }));
    expect(mocks.prisma.exerciseLibraryItem.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          organizationId: "org_1",
          scope: LibraryScope.PRIVATE,
          createdByUserId: "user_1"
        })
      })
    );
    expect(mocks.prisma.auditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ action: "exercise.created" })
      })
    );
  });

  it("prevents tenant users from mutating global exercises", async () => {
    mocks.prisma.exerciseLibraryItem.findFirst.mockResolvedValue(null);

    const response = await updateExercise(
      new Request("http://test.local/api/v1/exercises/exercise_global", {
        method: "PATCH",
        body: JSON.stringify({ name: "Mutated" })
      }),
      { params: Promise.resolve({ exerciseId: "exercise_global" }) }
    );

    expect(response.status).toBe(404);
    expect(mocks.prisma.exerciseLibraryItem.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          organizationId: "org_1",
          scope: LibraryScope.PRIVATE
        })
      })
    );
    expect(mocks.prisma.exerciseLibraryItem.update).not.toHaveBeenCalled();
  });

  it("reads one global exercise through tenant-scoped access", async () => {
    mocks.prisma.exerciseLibraryItem.findFirst.mockResolvedValue(globalExercise);

    const response = await getExercise(new Request("http://test.local/api/v1/exercises/exercise_global"), {
      params: Promise.resolve({ exerciseId: "exercise_global" })
    });
    const payload = (await response.json()) as { data: { id: string; scope: string } };

    expect(response.status).toBe(200);
    expect(payload.data).toEqual(expect.objectContaining({ id: "exercise_global", scope: "global" }));
  });

  it("creates and lists training program templates", async () => {
    mocks.prisma.trainingProgramTemplate.create.mockResolvedValue(templateRecord);
    mocks.prisma.trainingProgramTemplate.findMany.mockResolvedValue([templateRecord]);

    const createResponse = await createTrainingTemplate(
      new Request("http://test.local/api/v1/training-program-templates", {
        method: "POST",
        body: JSON.stringify({
          name: "Strength Foundation",
          description: "Base strength template",
          goal: "strength",
          durationWeeks: 8,
          status: "published",
          template: templateRecord.templateJson
        })
      })
    );

    expect(createResponse.status).toBe(201);
    expect(mocks.prisma.trainingProgramTemplate.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          organizationId: "org_1",
          templateJson: templateRecord.templateJson
        })
      })
    );

    const listResponse = await getTrainingTemplates(
      new Request("http://test.local/api/v1/training-program-templates?status=published")
    );
    const payload = (await listResponse.json()) as { data: Array<{ id: string; status: string }> };

    expect(listResponse.status).toBe(200);
    expect(payload.data[0]).toEqual(expect.objectContaining({ id: "template_1", status: "published" }));
  });

  it("creates immutable assignment snapshots from templates", async () => {
    mocks.prisma.client.findFirst.mockResolvedValue({ id: "client_1" });
    mocks.prisma.trainingProgramTemplate.findFirst.mockResolvedValue(templateRecord);
    mocks.prisma.trainingProgramAssignment.create.mockResolvedValue(assignmentRecord);

    const response = await createTrainingAssignment(
      new Request("http://test.local/api/v1/training-program-assignments", {
        method: "POST",
        body: JSON.stringify({
          clientId: "client_1",
          templateId: "template_1",
          startsOn: "2026-05-14",
          endsOn: "2026-07-09"
        })
      })
    );
    const payload = (await response.json()) as { data: { id: string; snapshot: { templateName: string } } };

    expect(response.status).toBe(201);
    expect(payload.data.snapshot.templateName).toBe("Strength Foundation");
    expect(mocks.prisma.trainingProgramAssignment.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          snapshotJson: expect.objectContaining({
            templateId: "template_1",
            templateName: "Strength Foundation"
          })
        })
      })
    );
  });

  it("lists training assignments and client training programs with organization scope", async () => {
    mocks.prisma.trainingProgramAssignment.findMany.mockResolvedValue([assignmentRecord]);
    mocks.prisma.client.findFirst.mockResolvedValue({ id: "client_1" });

    const listResponse = await getTrainingAssignments(
      new Request("http://test.local/api/v1/training-program-assignments?clientId=client_1")
    );
    const clientResponse = await getClientTrainingPrograms(
      new Request("http://test.local/api/v1/clients/client_1/training-programs"),
      { params: Promise.resolve({ clientId: "client_1" }) }
    );

    expect(listResponse.status).toBe(200);
    expect(clientResponse.status).toBe(200);
    expect(mocks.prisma.trainingProgramAssignment.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ organizationId: "org_1", clientId: "client_1" })
      })
    );
  });
});
