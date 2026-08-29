import Link from "next/link";

import prisma from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { StatusPill } from "@/components/ui/status-pill";

type SuccessPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CheckoutSuccessPage({ searchParams }: SuccessPageProps) {
  const params = await searchParams;
  const orderId = typeof params?.orderId === "string" ? params.orderId : null;
  const order = orderId
    ? await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          items: { include: { product: { select: { name: true } } } },
          paymentTransactions: { orderBy: { createdAt: "desc" }, take: 1 },
        },
      })
    : null;

  if (!order) {
    return <ResultShell type="missing" title="اطلاعات سفارش یافت نشد" message="برای مشاهده وضعیت سفارش باید شناسه معتبر داشته باشید." />;
  }

  const latestTransaction = order.paymentTransactions[0] ?? null;

  return (
    <div className="container-zen py-8 sm:py-10">
      <div className="mx-auto max-w-3xl border-y border-emerald-200 bg-white py-6 sm:py-8">
        <div className="flex items-start gap-4 border-r-4 border-emerald-500 pr-4">
          <div className="grid size-11 shrink-0 place-items-center text-2xl font-black text-[#16A34A]">✓</div>
          <div>
            <h1 className="text-xl font-extrabold text-[#111827] sm:text-2xl">پرداخت با موفقیت انجام شد</h1>
            <p className="mt-2 text-sm leading-7 text-[#6B7280]">سفارش #{order.id.slice(0, 10).toUpperCase()} ثبت شد و برای پردازش آماده است.</p>
          </div>
        </div>

        <div className="mt-6 divide-y divide-border border-y border-border sm:mt-8">
          <Info label="مبلغ پرداختی" value={formatPrice(order.total)} />
          <Info label="کد پیگیری پرداخت" value={latestTransaction?.refId ?? order.paymentRefId ?? "-"} mono />
          <Info label="وضعیت سفارش" value="پرداخت شده" />
          <Info label="تحویل گیرنده" value={order.fullName} />
          <Info label="زمان تحویل تقریبی" value={order.estimatedDeliveryLabel ?? "بعد از تایید تیم ارسال"} />
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <StatusPill tone="success">پرداخت تایید شد</StatusPill>
          {latestTransaction?.cardPan ? <StatusPill tone="neutral">{latestTransaction.cardPan}</StatusPill> : null}
        </div>

        <div className="mt-6 border-t border-border pt-5 sm:mt-8">
          <h2 className="text-sm font-black text-[#111827]">اقلام سفارش</h2>
          <div className="mt-3 divide-y divide-border border-y border-border">
            {order.items.map((item) => (
              <div key={item.id} className="flex min-h-11 items-start justify-between gap-3 py-3 text-xs text-[#6B7280]">
                <span className="min-w-0 break-words">{item.product.name}</span>
                <span className="font-bold text-[#111827]">{item.quantity.toLocaleString("fa-IR")} عدد</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2 sm:mt-8">
          <Link href={`/account?orderId=${order.id}`} className="btn-primary !min-h-11 px-4 text-center text-xs">
            مشاهده سفارش
          </Link>
          <Link href="/products" className="btn-ghost !min-h-11 px-3 text-center text-xs">
            بازگشت به فروشگاه
          </Link>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex min-h-11 flex-col justify-between gap-1 py-3 sm:flex-row sm:items-center sm:gap-4">
      <p className="text-xs text-[#6B7280]">{label}</p>
      <p className={`mt-1 break-words font-black text-[#111827] ${mono ? "font-mono text-xs" : "text-sm"}`}>{value}</p>
    </div>
  );
}

function ResultShell({ title, message }: { type: string; title: string; message: string }) {
  return (
    <div className="container-zen py-10 sm:py-16">
      <div className="mx-auto max-w-xl border-y border-[#E5E7EB] bg-white py-6 text-center sm:py-8">
        <h1 className="text-2xl font-extrabold text-[#111827]">{title}</h1>
        <p className="mt-3 text-sm text-[#6B7280]">{message}</p>
        <Link href="/products" className="btn-primary mt-8 inline-flex !min-h-11 px-4 text-xs">بازگشت به فروشگاه</Link>
      </div>
    </div>
  );
}
