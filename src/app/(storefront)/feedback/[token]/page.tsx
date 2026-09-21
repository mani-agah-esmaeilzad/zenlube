import type { Metadata } from "next";
import Link from "next/link";

import { PurchaseFeedbackForm } from "@/components/feedback/purchase-feedback-form";
import { feedbackOrderNumber, feedbackTokenSchema, hashFeedbackToken } from "@/lib/feedback";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "نظرسنجی خرید | اویل‌بار",
  description: "ثبت بازخورد مشتریان اویل‌بار پس از خرید",
  robots: { index: false, follow: false, nocache: true },
};

type FeedbackPageProps = {
  params: Promise<{ token: string }>;
};

export default async function FeedbackPage({ params }: FeedbackPageProps) {
  const { token } = await params;
  const parsedToken = feedbackTokenSchema.safeParse(token);
  const feedback = parsedToken.success
    ? await prisma.orderFeedback.findUnique({
        where: { tokenHash: hashFeedbackToken(parsedToken.data) },
        select: {
          status: true,
          expiresAt: true,
          submittedAt: true,
          order: {
            select: {
              id: true,
              fullName: true,
              items: {
                select: { quantity: true, product: { select: { name: true } } },
              },
            },
          },
        },
      })
    : null;

  const expired = feedback ? feedback.expiresAt.getTime() <= Date.now() : false;
  const unavailable = !feedback || expired;

  return (
    <div className="container-zen py-6 sm:py-8 md:py-12">
      <div className="mx-auto max-w-3xl">
        <header className="border-b border-border pb-6">
          <p className="text-xs font-extrabold text-primary-accent-strong">صدای مشتریان اویل‌بار</p>
          <h1 className="mt-2 text-2xl font-black tracking-[-0.03em] text-text-strong sm:text-3xl">تجربه خریدتان را با ما در میان بگذارید</h1>
          <p className="mt-3 text-sm leading-7 text-text-muted">پاسخ شما کمتر از یک دقیقه زمان می‌برد و مستقیماً برای بهبود خدمات بررسی می‌شود.</p>
        </header>

        {unavailable ? (
          <FeedbackUnavailable expired={expired} />
        ) : feedback.status === "SUBMITTED" ? (
          <section className="border-b border-border py-10 text-center">
            <h2 className="text-xl font-extrabold text-text-strong">نظر شما قبلاً ثبت شده است</h2>
            <p className="mt-2 text-sm leading-7 text-text-muted">از وقتی که برای اویل‌بار گذاشتید ممنونیم.</p>
            <Link href="/" className="btn-outline mt-5 inline-flex px-5">بازگشت به فروشگاه</Link>
          </section>
        ) : (
          <>
            <section className="grid gap-4 border-b border-border py-5 sm:grid-cols-[0.7fr_1.3fr]">
              <div>
                <p className="text-xs font-bold text-text-muted">سفارش</p>
                <p className="mt-1 font-mono text-sm font-black text-text-strong" dir="ltr">#{feedbackOrderNumber(feedback.order.id)}</p>
                <p className="mt-2 text-sm font-extrabold text-text-strong">{feedback.order.fullName}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-text-muted">محصولات این خرید</p>
                <ul className="mt-1 space-y-1 text-sm leading-6 text-text-strong">
                  {feedback.order.items.map((item) => <li key={`${item.product.name}-${item.quantity}`}>{item.product.name} × {item.quantity.toLocaleString("fa-IR")}</li>)}
                </ul>
              </div>
            </section>
            <section className="py-7 sm:py-9">
              <PurchaseFeedbackForm token={token} />
            </section>
          </>
        )}
      </div>
    </div>
  );
}

function FeedbackUnavailable({ expired }: { expired: boolean }) {
  return (
    <section className="border-b border-border py-10 text-center">
      <h2 className="text-xl font-extrabold text-text-strong">{expired ? "مهلت این نظرسنجی تمام شده است" : "لینک نظرسنجی معتبر نیست"}</h2>
      <p className="mt-2 text-sm leading-7 text-text-muted">برای دریافت راهنمایی می‌توانید با پشتیبانی اویل‌بار در ارتباط باشید.</p>
      <div className="mt-5 flex flex-wrap justify-center gap-3">
        <a href="tel:09190810910" className="btn-primary px-5">تماس با پشتیبانی</a>
        <Link href="/" className="btn-outline px-5">بازگشت به فروشگاه</Link>
      </div>
    </section>
  );
}
