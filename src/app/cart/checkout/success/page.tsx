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
      <div className="bg-slate-50">
        <div className="mx-auto max-w-2xl px-6 py-16 text-center">
          <h1 className="text-3xl font-semibold text-slate-900">اطلاعات سفارش یافت نشد</h1>
          <p className="mt-4 text-sm text-slate-600">برای مشاهده وضعیت سفارش باید شناسه معتبر داشته باشید.</p>
          <Link href="/products" className="mt-8 inline-flex rounded-full bg-sky-500 px-6 py-3 text-sm font-semibold text-white hover:bg-sky-600">
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
      <div className="bg-slate-50">
        <div className="mx-auto max-w-2xl px-6 py-16 text-center">
          <h1 className="text-3xl font-semibold text-slate-900">سفارش یافت نشد</h1>
          <p className="mt-4 text-sm text-slate-600">شناسه سفارش وارد شده معتبر نیست یا پرداخت تکمیل نشده است.</p>
          <Link href="/products" className="mt-8 inline-flex rounded-full bg-sky-500 px-6 py-3 text-sm font-semibold text-white hover:bg-sky-600">
            بازگشت به فروشگاه
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <div className="rounded-3xl border border-emerald-100 bg-white p-10 shadow-xl shadow-emerald-100/40">
          <h1 className="text-3xl font-semibold text-slate-900">پرداخت با موفقیت انجام شد</h1>
          <p className="mt-2 text-sm text-slate-600">سفارش شما با شناسه {order.id.slice(0, 10)} ثبت شده است.</p>
          <div className="mt-8 space-y-4 text-sm text-slate-600">
            <div className="flex items-center justify-between">
              <span>مبلغ پرداختی</span>
              <span className="font-semibold text-slate-900">{formatPrice(order.total)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>کد پیگیری زرین‌پال</span>
              <span className="font-mono text-xs text-slate-500">{order.paymentRefId ?? "-"}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-slate-900">اقلام سفارش</span>
              <ul className="space-y-1 text-xs text-slate-600">
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
              className="rounded-full border border-slate-300 px-5 py-2 text-slate-700 transition hover:border-slate-400"
            >
              مشاهده وضعیت سفارش
            </Link>
            <Link
              href="/products"
              className="rounded-full bg-sky-500 px-5 py-2 text-white transition hover:bg-sky-600"
            >
              ادامه خرید
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
