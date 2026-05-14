import { beforeEach, describe, expect, it, vi } from "vitest";

import { ClientStatus, LeadStage, LeadStatus } from "@/app/generated/prisma/enums";
import { GET as getClients, POST as postClient } from "@/app/api/v1/clients/route";
import { GET as getLeads, POST as postLead } from "@/app/api/v1/leads/route";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  prisma: {
    client: {
      findMany: vi.fn(),
      create: vi.fn()
    },
    lead: {
      findMany: vi.fn(),
      create: vi.fn()
    },
    auditLog: {
      create: vi.fn()
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

describe("client and CRM API tenancy", () => {
  beforeEach(() => {
    mocks.auth.mockReset();
    mocks.prisma.client.findMany.mockReset();
    mocks.prisma.client.create.mockReset();
    mocks.prisma.lead.findMany.mockReset();
    mocks.prisma.lead.create.mockReset();
    mocks.prisma.auditLog.create.mockReset();
  });

  it("creates clients in the active organization and writes an audit log", async () => {
    mocks.auth.mockResolvedValue(ownerSession);
    mocks.prisma.client.create.mockResolvedValue({
      id: "client_1",
      firstName: "Emma",
      lastName: "Thompson",
      email: "emma@example.com",
      status: ClientStatus.NEW,
      packageName: "Standard Package",
      checkInDay: "Tuesday",
      startDate: null,
      latestCheckInAt: null,
      compliance: 0
    });
    mocks.prisma.auditLog.create.mockResolvedValue({});

    const response = await postClient(
      new Request("http://test.local/api/v1/clients", {
        method: "POST",
        body: JSON.stringify({
          firstName: "Emma",
          lastName: "Thompson",
          email: "EMMA@example.com",
          status: "new"
        })
      })
    );

    expect(response.status).toBe(201);
    expect(mocks.prisma.client.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          organizationId: "org_1",
          email: "emma@example.com"
        })
      })
    );
    expect(mocks.prisma.auditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          action: "client.created",
          organizationId: "org_1"
        })
      })
    );
  });

  it("requires authentication for client lists", async () => {
    mocks.auth.mockResolvedValue(null);

    const response = await getClients(new Request("http://test.local/api/v1/clients"));

    expect(response.status).toBe(401);
  });

  it("scopes client list queries to the active organization", async () => {
    mocks.auth.mockResolvedValue(ownerSession);
    mocks.prisma.client.findMany.mockResolvedValue([
      {
        id: "client_1",
        firstName: "Marcus",
        lastName: "Rodriguez",
        email: "marcus@example.com",
        status: ClientStatus.ACTIVE,
        packageName: "Elite Performance",
        checkInDay: "Monday",
        startDate: new Date("2026-01-15T00:00:00.000Z"),
        latestCheckInAt: new Date("2026-04-14T00:00:00.000Z"),
        compliance: 96
      }
    ]);

    const response = await getClients(
      new Request("http://test.local/api/v1/clients?status=active&search=marcus")
    );
    const payload = (await response.json()) as { data: Array<{ name: string }> };

    expect(response.status).toBe(200);
    expect(payload.data[0]?.name).toBe("Marcus Rodriguez");
    expect(mocks.prisma.client.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          organizationId: "org_1",
          status: ClientStatus.ACTIVE
        })
      })
    );
  });

  it("scopes lead list queries to the active organization", async () => {
    mocks.auth.mockResolvedValue(ownerSession);
    mocks.prisma.lead.findMany.mockResolvedValue([
      {
        id: "lead_1",
        name: "Jessica Martinez",
        email: "jessica@example.com",
        phone: "+1 555",
        source: "Instagram",
        status: LeadStatus.HOT,
        stage: LeadStage.INITIAL_CONTACT,
        location: "Los Angeles, CA",
        notes: "Interested in premium package",
        lastContactAt: null,
        daysInStage: 2
      }
    ]);

    const response = await getLeads(
      new Request("http://test.local/api/v1/leads?stage=initial-contact&status=hot")
    );
    const payload = (await response.json()) as { data: Array<{ stage: string }> };

    expect(response.status).toBe(200);
    expect(payload.data[0]?.stage).toBe("initial-contact");
    expect(mocks.prisma.lead.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          organizationId: "org_1",
          status: LeadStatus.HOT,
          stage: LeadStage.INITIAL_CONTACT
        })
      })
    );
  });

  it("creates leads in the active organization and writes an audit log", async () => {
    mocks.auth.mockResolvedValue(ownerSession);
    mocks.prisma.lead.create.mockResolvedValue({
      id: "lead_1",
      name: "Jessica Martinez",
      email: "jessica@example.com",
      phone: "+1 555",
      source: "Instagram",
      status: LeadStatus.HOT,
      stage: LeadStage.INITIAL_CONTACT,
      location: "Los Angeles, CA",
      notes: "Interested in premium package",
      lastContactAt: null,
      daysInStage: 0
    });
    mocks.prisma.auditLog.create.mockResolvedValue({});

    const response = await postLead(
      new Request("http://test.local/api/v1/leads", {
        method: "POST",
        body: JSON.stringify({
          name: "Jessica Martinez",
          email: "JESSICA@example.com",
          status: "hot",
          stage: "initial-contact"
        })
      })
    );

    expect(response.status).toBe(201);
    expect(mocks.prisma.lead.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          organizationId: "org_1",
          email: "jessica@example.com",
          stage: LeadStage.INITIAL_CONTACT
        })
      })
    );
    expect(mocks.prisma.auditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          action: "lead.created",
          organizationId: "org_1"
        })
      })
    );
  });
});
