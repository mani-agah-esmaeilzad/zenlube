import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { publicQuestionPayloadSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
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

    const { type, slug, authorName, question } = parsed.data;

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
    console.error("Failed to submit question", error);
    return NextResponse.json({ ok: false, message: "خطایی رخ داده است." }, { status: 500 });
  }
}
