export interface AuditEventInput {
  action: string;
  actorUserId?: string | null;
  organizationId?: string | null;
  targetType?: string | null;
  targetId?: string | null;
  metadata?: Record<string, unknown>;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export function buildAuditEvent(input: AuditEventInput) {
  return {
    action: input.action,
    actorUserId: input.actorUserId ?? null,
    organizationId: input.organizationId ?? null,
    targetType: input.targetType ?? null,
    targetId: input.targetId ?? null,
    metadata: input.metadata ?? undefined,
    ipAddress: input.ipAddress ?? null,
    userAgent: input.userAgent ?? null
  };
}
