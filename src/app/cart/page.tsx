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
      <div className="container-zen py-20">
        <div className="mx-auto max-w-xl rounded-3xl border border-[#E5E7EB] bg-white p-8 text-center">
          <h1 className="text-2xl font-extrabold text-[#111827]">سبد خرید</h1>
          <p className="mt-4 text-sm leading-7 text-[#6B7280]">برای مشاهده و مدیریت سبد خرید، ابتدا وارد حساب کاربری خود شوید.</p>
          <Link href="/sign-in" className="btn-primary mt-6">ورود به حساب کاربری</Link>
        </div>
      </div>
    );
  }

  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: { include: { product: { include: { brand: true } } } } },
  });

  const subtotal = cart?.items.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0) ?? 0;

  return (
    <div className="container-zen space-y-6 py-6 md:py-8">
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#111827] md:text-3xl">سبد خرید</h1>
          <p className="mt-2 text-sm leading-7 text-[#6B7280]">محصولات انتخاب‌شده را بررسی کنید و سپس وارد مرحله ارسال و پرداخت شوید.</p>
        </div>
        {cart?.items?.length ? <ClearCartButton /> : null}
      </header>

      {cart?.items?.length ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            {cart.items.map((item) => (
              <article key={item.id} className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-base font-bold leading-7 text-[#111827]">{item.product.name}</h2>
                    <p className="mt-1 text-xs font-medium text-[#6B7280]">برند {item.product.brand.name}</p>
                    <p className="mt-3 text-sm text-[#6B7280]">قیمت واحد: {formatPrice(item.product.price)}</p>
                  </div>
                  <div className="flex flex-col gap-3 md:items-end">
                    <p className="text-lg font-extrabold text-[#111827]">{formatPrice(Number(item.product.price) * item.quantity)}</p>
                    <CartItemControls productId={item.productId} quantity={item.quantity} />
                  </div>
                </div>
              </article>
            ))}
          </div>

          <aside className="h-fit rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-[0_10px_28px_rgba(17,24,39,0.06)] lg:sticky lg:top-40">
            <h2 className="text-lg font-extrabold text-[#111827]">خلاصه سفارش</h2>
            <div className="mt-5 space-y-4 text-sm text-[#6B7280]">
              <div className="flex justify-between">
                <span>جمع کل</span>
                <span className="font-bold text-[#111827]">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>هزینه ارسال</span>
                <span>محاسبه در مرحله بعد</span>
              </div>
            </div>
            <Link href="/cart/checkout" className="btn-primary mt-6 w-full">ادامه فرایند خرید</Link>
            <p className="mt-4 text-xs leading-6 text-[#6B7280]">تایید نهایی سفارش بعد از ورود اطلاعات ارسال و پرداخت انجام می‌شود.</p>
          </aside>
        </div>
      ) : (
        <div className="rounded-3xl border border-[#E5E7EB] bg-white p-10 text-center">
          <h2 className="text-xl font-extrabold text-[#111827]">سبد خرید شما خالی است</h2>
          <p className="mt-3 text-sm leading-7 text-[#6B7280]">از صفحه محصولات بازدید کنید و پیشنهادهای ویژه را از دست ندهید.</p>
          <Link href="/products" className="btn-primary mt-6">رفتن به فروشگاه</Link>
        </div>
      )}
    </div>
  );
}
