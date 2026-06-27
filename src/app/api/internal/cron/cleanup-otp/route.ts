import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { config } from "@/lib/config";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

function authorize(request: Request) {
  if (!config.CRON_SECRET) {
    return true;
  }
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) {
    return false;
  }
  const token = header.slice("Bearer ".length).trim();
  return token === config.CRON_SECRET;
}

export async function POST(request: Request) {
  if (!authorize(request)) {
    return NextResponse.json({ ok: false, message: "unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const expiredThreshold = new Date(now.getTime() - 60 * 60 * 1000);
  const staleThreshold = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const result = await prisma.otpRequest.deleteMany({
    where: {
      OR: [
        { expiresAt: { lt: now } },
        { consumedAt: { lt: expiredThreshold } },
        { createdAt: { lt: staleThreshold } },
      ],
    },
  });

  logger.info("OTP cleanup job executed", { deleted: result.count });

  return NextResponse.json({ ok: true, deleted: result.count });
}
