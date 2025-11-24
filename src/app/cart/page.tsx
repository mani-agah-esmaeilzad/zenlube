import Link from "next/link";
import { CartItemControls, ClearCartButton } from "@/components/cart/cart-item-controls";
import prisma from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { getAppSession } from "@/lib/session";

export default async function CartPage() {
  const rawSession = await getAppSession();
  const userId = (rawSession as { user?: { id?: string } } | null)?.user?.id;

  if (!userId) {
    return (
      <div className="bg-slate-50">
        <div className="mx-auto max-w-3xl px-6 py-24 text-center">
          <h1 className="text-3xl font-semibold text-slate-900">سبد خرید</h1>
          <p className="mt-4 text-sm text-slate-600">
            برای مشاهده و مدیریت سبد خرید، ابتدا وارد حساب کاربری خود شوید.
          </p>
          <Link
            href="/sign-in"
            className="mt-6 inline-flex rounded-full bg-sky-500 px-6 py-2 text-sm font-semibold text-white hover:bg-sky-600"
          >
            ورود به حساب کاربری
          </Link>
        </div>
      </div>
    );
  }

  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            include: {
              brand: true,
            },
          },
        },
      },
    },
  });

  const subtotal = cart?.items.reduce((sum, item) => {
    const price = Number(item.product.price);
    return sum + price * item.quantity;
  }, 0) ?? 0;

  return (
    <div className="bg-slate-50">
      <div className="mx-auto max-w-5xl px-6 py-12 space-y-10">
        <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">سبد خرید</h1>
            <p className="text-sm text-slate-600">
              محصولات انتخاب‌شده شما در پایین قابل مشاهده است. می‌توانید مقدار هر محصول را تغییر دهید یا آن را حذف کنید.
            </p>
          </div>
          {cart?.items?.length ? <ClearCartButton /> : null}
        </header>

      {cart?.items?.length ? (
        <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-6">
            {cart.items.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="space-y-2">
                  <h2 className="text-lg font-semibold text-slate-900">{item.product.name}</h2>
                  <p className="text-xs text-slate-500">برند {item.product.brand.name}</p>
                  <p className="text-sm text-slate-600">
                    قیمت واحد: {formatPrice(item.product.price)}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-3">
                  <p className="text-sm font-semibold text-slate-900">
                    {formatPrice(Number(item.product.price) * item.quantity)}
                  </p>
                  <CartItemControls productId={item.productId} quantity={item.quantity} />
                </div>
              </div>
            ))}
          </div>
          <aside className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-md">
            <h2 className="text-lg font-semibold text-slate-900">خلاصه سفارش</h2>
            <div className="mt-4 space-y-3">
              <div className="flex justify-between">
                <span>جمع کل</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>هزینه ارسال</span>
                <span>محاسبه در مرحله بعد</span>
              </div>
            </div>
            <Link
              href="/cart/checkout"
              className="mt-6 inline-flex w-full justify-center rounded-full bg-sky-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-600"
            >
              ادامه فرآیند خرید
            </Link>
            <p className="mt-4 text-xs text-slate-500">
              تایید نهایی سفارش بعد از ورود اطلاعات ارسال و پرداخت انجام می‌شود.
            </p>
          </aside>
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-500">
          سبد خرید شما خالی است. از صفحه محصولات بازدید کنید و پیشنهادات ویژه را از دست ندهید.
          <div className="mt-6">
            <Link
              href="/products"
              className="inline-flex rounded-full bg-sky-500 px-6 py-2 text-sm font-semibold text-white hover:bg-sky-600"
            >
              رفتن به فروشگاه
            </Link>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
