import Link from "next/link";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { getAppSession } from "@/lib/session";

export default async function AccountPage() {
  const rawSession = await getAppSession();
  const user = (rawSession as { user?: { id?: string; name?: string | null; email?: string | null } } | null)?.user;

  if (!user?.id) {
    redirect("/sign-in?callbackUrl=/account");
  }

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  return (
    <div className="mx-auto max-w-4xl px-6 py-12 space-y-12">
      <section className="rounded-3xl border border-white/10 bg-white/5 p-8">
        <h1 className="text-3xl font-semibold text-white">حساب کاربری</h1>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <span className="text-xs text-white/50">نام</span>
            <p className="text-lg text-white">{user.name ?? "کاربر ZenLube"}</p>
          </div>
          <div className="space-y-2">
            <span className="text-xs text-white/50">ایمیل</span>
            <p className="text-lg text-white">{user.email}</p>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">سفارش‌های اخیر</h2>
            <p className="text-sm text-white/70">تاریخچه سفارشات تکمیل‌شده و در انتظار پردازش.</p>
          </div>
          <Link
            href="/products"
            className="rounded-full border border-white/15 px-4 py-2 text-xs text-white/70 hover:border-purple-300 hover:text-white"
          >
            خرید محصول جدید
          </Link>
        </header>

        {orders.length ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-white/60">شناسه سفارش</p>
                    <p className="text-lg font-semibold text-white">{order.id.slice(0, 10)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-white/60">وضعیت</p>
                    <p className="text-base font-semibold text-purple-200">{translateStatus(order.status)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-white/60">مبلغ</p>
                    <p className="text-base font-semibold text-purple-200">{formatPrice(order.total)}</p>
                  </div>
                </div>
                <div className="mt-4 space-y-2 text-xs text-white/60">
                  {order.items.map((item) => (
                    <p key={item.id}>
                      {item.quantity}× {item.product.name}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-white/10 bg-black/30 p-12 text-center text-white/60">
            هنوز سفارشی ثبت نکرده‌اید.
          </div>
        )}
      </section>
    </div>
  );
}

function translateStatus(status: string) {
  switch (status) {
    case "PENDING":
      return "در انتظار پرداخت";
    case "PAID":
      return "پرداخت‌شده";
    case "SHIPPED":
      return "ارسال شده";
    case "DELIVERED":
      return "تحویل داده شده";
    case "CANCELLED":
      return "لغو شده";
    default:
      return status;
  }
}
