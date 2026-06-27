import crypto from "crypto";

import prisma from "./prisma";
import { logger } from "./logger";

export type RateLimitResult = {
  success: boolean;
  remaining: number;
  resetAt: Date;
};

function getWindowKey(windowSeconds: number) {
  const now = Date.now();
  const windowStart = Math.floor(now / (windowSeconds * 1000));
  return windowStart.toString(36);
}

function normalizeIdentifier(identifier: string) {
  return crypto.createHash("sha256").update(identifier).digest("hex");
}

export async function consumeRateLimit(
  identifier: string,
  windowSeconds: number,
  limit: number,
): Promise<RateLimitResult> {
  const windowKey = getWindowKey(windowSeconds);
  const hashedIdentifier = normalizeIdentifier(identifier);

  const existing = await prisma.rateLimitHit.count({
    where: {
      identifier: hashedIdentifier,
      windowKey,
    },
  });

  if (existing >= limit) {
    const resetAt = new Date(Math.ceil(Date.now() / (windowSeconds * 1000)) * windowSeconds * 1000);
    return { success: false, remaining: 0, resetAt };
  }

  await prisma.rateLimitHit.create({
    data: {
      identifier: hashedIdentifier,
      windowKey,
    },
  });

  // fire-and-forget cleanup for stale entries older than 24h
  prisma.rateLimitHit
    .deleteMany({
      where: {
        createdAt: {
          lt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
    })
    .catch((error) => {
      logger.debug("Failed to cleanup rate limit hits", { error: error instanceof Error ? error.message : error });
    });

  return {
    success: true,
    remaining: Math.max(limit - existing - 1, 0),
    resetAt: new Date(Math.ceil(Date.now() / (windowSeconds * 1000)) * windowSeconds * 1000),
  };
}
