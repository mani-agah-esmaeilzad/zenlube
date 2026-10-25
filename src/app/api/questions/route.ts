import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { publicQuestionPayloadSchema } from "@/lib/validators";
import { storefrontVisibleCarWhere } from "@/lib/storefront-visibility";
import { config } from "@/lib/config";
import { consumeRateLimit } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

const QUESTION_PAYLOAD_MAX_BYTES = 12_000;
const QUESTION_MIN_COMPLETION_MS = 3_000;
const QUESTION_CLIENT_CLOCK_SKEW_MS = 60 * 60 * 1_000;
const QUESTION_COOLDOWN_SECONDS = 60;

function isTooFastSubmission(formStartedAt: number | undefined, now: number) {
  if (!formStartedAt) return true;
  if (formStartedAt > now + QUESTION_CLIENT_CLOCK_SKEW_MS) return true;
  return now - formStartedAt < QUESTION_MIN_COMPLETION_MS;
}

export async function POST(request: Request) {
  try {
    const forwardedFor = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip");
    const clientIp = forwardedFor?.split(",")[0]?.trim() ?? "unknown";
    const rateLimitResult = await consumeRateLimit(
      `question:${clientIp}`,
      config.QUESTION_RATE_LIMIT_WINDOW,
      config.QUESTION_RATE_LIMIT_MAX,
    );

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          ok: false,
          message: "به علت تعداد بالای درخواست‌ها، لطفاً بعداً تلاش کنید.",
        },
        { status: 429 },
      );
    }

    const contentLength = Number(request.headers.get("content-length") ?? 0);
    if (Number.isFinite(contentLength) && contentLength > QUESTION_PAYLOAD_MAX_BYTES) {
      return NextResponse.json(
        { ok: false, message: "حجم درخواست بیش از حد مجاز است." },
        { status: 413 },
      );
    }

    const rawPayload = await request.text();
    if (new TextEncoder().encode(rawPayload).byteLength > QUESTION_PAYLOAD_MAX_BYTES) {
      return NextResponse.json(
        { ok: false, message: "حجم درخواست بیش از حد مجاز است." },
        { status: 413 },
      );
    }

    let payload: unknown;
    try {
      payload = JSON.parse(rawPayload);
    } catch {
      return NextResponse.json(
        { ok: false, message: "ساختار درخواست معتبر نیست." },
        { status: 400 },
      );
    }

    const parsed = publicQuestionPayloadSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { type, slug, authorName, question, website, formStartedAt } = parsed.data;

    if (website || isTooFastSubmission(formStartedAt, Date.now())) {
      return NextResponse.json(
        { ok: false, message: "امکان ارسال سوال وجود ندارد. لطفاً چند لحظه دیگر تلاش کنید." },
        { status: 400 },
      );
    }

    const cooldownResult = await consumeRateLimit(`question-cooldown:${clientIp}`, QUESTION_COOLDOWN_SECONDS, 1);
    if (!cooldownResult.success) {
      return NextResponse.json(
        { ok: false, message: "برای ارسال سوال بعدی لطفاً کمی صبر کنید." },
        { status: 429 },
      );
    }

    if (type === "product") {
      const product = await prisma.product.findUnique({
        where: { slug },
        select: { id: true },
      });

      if (!product) {
        return NextResponse.json(
          { ok: false, message: "محصول مورد نظر یافت نشد." },
          { status: 404 },
        );
      }

      await prisma.productQuestion.create({
        data: {
          productId: product.id,
          authorName,
          question,
          status: "PENDING",
        },
      });

      revalidatePath(`/products/${slug}`);

      return NextResponse.json({ ok: true });
    }

    const car = await prisma.car.findFirst({
      where: storefrontVisibleCarWhere({ slug }),
      select: { id: true },
    });

    if (!car) {
      return NextResponse.json(
        { ok: false, message: "خودرو مورد نظر یافت نشد." },
        { status: 404 },
      );
    }

    await prisma.carQuestion.create({
      data: {
        carId: car.id,
        authorName,
        question,
        status: "PENDING",
      },
    });

    revalidatePath(`/cars/${slug}`);

    return NextResponse.json({ ok: true });
  } catch (error) {
    logger.error("Failed to submit question", { error: error instanceof Error ? error.message : error });
    return NextResponse.json({ ok: false, message: "خطایی رخ داده است." }, { status: 500 });
  }
}
