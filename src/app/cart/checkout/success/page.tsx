import Link from "next/link";

import prisma from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";

type SuccessPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CheckoutSuccessPage({ searchParams }: SuccessPageProps) {
  const params = await searchParams;
  const orderId = typeof params?.orderId === "string" ? params.orderId : null;

  if (!orderId) {
    return (
      <div className="w-full bg-slate-950 text-white">
        <div className="mx-auto max-w-2xl px-6 py-16 text-center">
          <h1 className="text-3xl font-semibold">اطلاعات سفارش یافت نشد</h1>
          <p className="mt-4 text-sm text-white/70">برای مشاهده وضعیت سفارش باید شناسه معتبر داشته باشید.</p>
          <Link href="/products" className="mt-8 inline-flex rounded-full bg-purple-500 px-6 py-3 text-sm font-semibold text-white">
            بازگشت به فروشگاه
          </Link>
        </div>
      </div>
    );
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: { select: { name: true } },
        },
      },
    },
  });

  if (!order) {
    return (
      <div className="w-full bg-slate-950 text-white">
        <div className="mx-auto max-w-2xl px-6 py-16 text-center">
          <h1 className="text-3xl font-semibold">سفارش یافت نشد</h1>
          <p className="mt-4 text-sm text-white/70">شناسه سفارش وارد شده معتبر نیست یا پرداخت تکمیل نشده است.</p>
          <Link href="/products" className="mt-8 inline-flex rounded-full bg-purple-500 px-6 py-3 text-sm font-semibold text-white">
            بازگشت به فروشگاه
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-950 text-white">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <div className="rounded-3xl border border-emerald-400/40 bg-emerald-900/30 p-10">
          <h1 className="text-3xl font-semibold text-emerald-100">پرداخت با موفقیت انجام شد</h1>
          <p className="mt-2 text-sm text-emerald-200">سفارش شما با شناسه {order.id.slice(0, 10)} ثبت شده است.</p>
          <div className="mt-8 space-y-4 text-sm text-white/80">
            <div className="flex items-center justify-between">
              <span>مبلغ پرداختی</span>
              <span className="font-semibold text-emerald-100">{formatPrice(order.total)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>کد پیگیری زرین‌پال</span>
              <span className="font-mono text-xs text-emerald-200">{order.paymentRefId ?? "-"}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span>اقلام سفارش</span>
              <ul className="space-y-1 text-xs text-white/70">
                {order.items.map((item) => (
                  <li key={item.id}>
                    {item.quantity}× {item.product.name}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-10 flex flex-wrap gap-3 text-xs">
            <Link
              href="/account"
              className="rounded-full border border-white/30 px-5 py-2 text-white transition hover:border-white hover:text-white"
            >
              مشاهده وضعیت سفارش
            </Link>
            <Link
              href="/products"
              className="rounded-full bg-purple-500 px-5 py-2 text-white transition hover:bg-purple-400"
            >
              ادامه خرید
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
