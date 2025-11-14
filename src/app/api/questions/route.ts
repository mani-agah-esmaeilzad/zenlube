import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { publicQuestionPayloadSchema } from "@/lib/validators";
import { config } from "@/lib/config";
import { consumeRateLimit } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

async function verifyCaptcha(token: string | undefined, remoteIp: string | undefined) {
  if (!config.HCAPTCHA_SECRET) {
    return true;
  }
  if (!token) {
    return false;
  }

  try {
    const response = await fetch("https://hcaptcha.com/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        secret: config.HCAPTCHA_SECRET,
        response: token,
        remoteip: remoteIp ?? "",
      }),
    });

    if (!response.ok) {
      logger.warn("Captcha verification failed", { status: response.status });
      return false;
    }

    const payload = (await response.json()) as { success?: boolean };
    return Boolean(payload.success);
  } catch (error) {
    logger.error("Captcha verification threw", { error: error instanceof Error ? error.message : error });
    return false;
  }
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

    const payload = await request.json();
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

    const { type, slug, authorName, question, captchaToken } = parsed.data;

    const captchaValid = await verifyCaptcha(captchaToken ?? undefined, clientIp);

    if (!captchaValid) {
      return NextResponse.json(
        { ok: false, message: "اعتبارسنجی کپچا ناموفق بود." },
        { status: 400 },
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

    const car = await prisma.car.findUnique({
      where: { slug },
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
