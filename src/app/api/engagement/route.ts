import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { engagementEventSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const parsed = engagementEventSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const { entityType, entityId, eventType, metadata } = parsed.data;

    await prisma.engagementEvent.create({
      data: {
        entityType,
        entityId,
        eventType,
        metadata: metadata ?? {},
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to record engagement", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
