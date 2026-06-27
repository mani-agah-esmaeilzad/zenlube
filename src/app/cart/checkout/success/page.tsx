import Link from "next/link";

import prisma from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";

type SuccessPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CheckoutSuccessPage({ searchParams }: SuccessPageProps) {
  const params = await searchParams;
  const orderId = typeof params?.orderId === "string" ? params.orderId : null;
  const order = orderId
    ? await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: { include: { product: { select: { name: true } } } } },
      })
    : null;

  if (!order) {
    return <ResultShell type="missing" title="اطلاعات سفارش یافت نشد" message="برای مشاهده وضعیت سفارش باید شناسه معتبر داشته باشید." />;
  }

  return (
    <div className="container-zen py-10">
      <div className="mx-auto max-w-3xl rounded-3xl border border-emerald-200 bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-col gap-4 text-center md:items-center">
          <div className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-50 text-3xl font-black text-[#16A34A]">✓</div>
          <div>
            <h1 className="text-2xl font-extrabold text-[#111827] md:text-3xl">پرداخت با موفقیت انجام شد</h1>
            <p className="mt-2 text-sm leading-7 text-[#6B7280]">سفارش #{order.id.slice(0, 10).toUpperCase()} ثبت شد و برای پردازش آماده است.</p>
          </div>
        </div>

        <div className="mt-8 grid gap-3 md:grid-cols-2">
          <Info label="مبلغ پرداختی" value={formatPrice(order.total)} />
          <Info label="کد پیگیری پرداخت" value={order.paymentRefId ?? "-"} mono />
          <Info label="وضعیت سفارش" value="پرداخت شده" />
          <Info label="تحویل گیرنده" value={order.fullName} />
        </div>

        <div className="mt-8 rounded-3xl border border-[#E5E7EB] p-5">
          <h2 className="text-sm font-black text-[#111827]">اقلام سفارش</h2>
          <div className="mt-3 space-y-2">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between rounded-2xl bg-[#F7F7F8] px-3 py-2 text-xs text-[#6B7280]">
                <span>{item.product.name}</span>
                <span className="font-bold text-[#111827]">{item.quantity.toLocaleString("fa-IR")} عدد</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href={`/account?orderId=${order.id}`} className="btn-primary flex-1 text-center">
            مشاهده سفارش
          </Link>
          <Link href="/products" className="btn-outline flex-1 text-center">
            بازگشت به فروشگاه
          </Link>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-[#F7F7F8] p-4">
      <p className="text-xs text-[#6B7280]">{label}</p>
      <p className={`mt-1 font-black text-[#111827] ${mono ? "font-mono text-xs" : "text-sm"}`}>{value}</p>
    </div>
  );
}

function ResultShell({ title, message }: { type: string; title: string; message: string }) {
  return (
    <div className="container-zen py-16 text-center">
      <div className="mx-auto max-w-xl rounded-3xl border border-[#E5E7EB] bg-white p-8">
        <h1 className="text-2xl font-extrabold text-[#111827]">{title}</h1>
        <p className="mt-3 text-sm text-[#6B7280]">{message}</p>
        <Link href="/products" className="btn-primary mt-8 inline-flex">بازگشت به فروشگاه</Link>
      </div>
    </div>
  );
}
