import type { Prisma } from "@/generated/prisma";
import prisma from "@/lib/prisma";

type AuditInput = {
  actorUserId?: string | null;
  targetType: string;
  targetId: string;
  action: string;
  summary: string;
  metadata?: Prisma.InputJsonValue;
};

export async function createAuditLog(input: AuditInput) {
  await prisma.adminAuditLog.create({
    data: {
      actorUserId: input.actorUserId ?? null,
      targetType: input.targetType,
      targetId: input.targetId,
      action: input.action,
      summary: input.summary,
      metadata: input.metadata,
    },
  });
}

export async function createAuditLogTx(tx: Prisma.TransactionClient, input: AuditInput) {
  await tx.adminAuditLog.create({
    data: {
      actorUserId: input.actorUserId ?? null,
      targetType: input.targetType,
      targetId: input.targetId,
      action: input.action,
      summary: input.summary,
      metadata: input.metadata,
    },
  });
}
