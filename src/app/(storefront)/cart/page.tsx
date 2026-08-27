import Link from "next/link";

import { CartItemControls, ClearCartButton } from "@/components/cart/cart-item-controls";
import { EmptyState } from "@/components/ui/empty-state";
import { PriceBlock } from "@/components/ui/price-block";
import prisma from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { getAppSession } from "@/lib/session";

export default async function CartPage() {
  const rawSession = await getAppSession();
  const userId = (rawSession as { user?: { id?: string } } | null)?.user?.id;

  if (!userId) {
    return (
      <div className="container-zen py-10 sm:py-14 md:py-20">
        <div className="mx-auto max-w-xl">
          <EmptyState
            actionHref="/sign-in"
            actionLabel="ورود به حساب کاربری"
            description="برای مشاهده و مدیریت سبد خرید، ابتدا وارد حساب کاربری خود شوید."
            title="سبد خرید فقط برای کاربران واردشده در دسترس است"
          />
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
    <div className="container-zen space-y-5 py-5 sm:space-y-6 sm:py-6 md:py-8">
      <header className="flex items-end justify-between gap-4">
        <div>
          <h1 className="t-h1">سبد خرید</h1>
          <p className="mt-2 hidden text-sm leading-7 text-text-muted sm:block">محصولات انتخاب‌شده را بررسی کنید و سپس وارد مرحله ارسال و پرداخت شوید.</p>
        </div>
        {cart?.items?.length ? <ClearCartButton /> : null}
      </header>

      {cart?.items?.length ? (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px] xl:gap-8">
            <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-white">
            {cart.items.map((item) => (
              <article key={item.id} className="p-4 sm:p-5">
                <div className="grid grid-cols-[72px_minmax(0,1fr)] gap-3 sm:grid-cols-[88px_minmax(0,1fr)] sm:gap-4">
                  <Link className="relative aspect-square overflow-hidden rounded-xl bg-surface-secondary" href={`/products/${item.product.slug}`}>
                    {item.product.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img alt={item.product.name} className="h-full w-full object-contain p-2" src={item.product.imageUrl} />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs font-bold text-text-soft">بدون تصویر</div>
                    )}
                  </Link>
                  <div className="min-w-0">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                      <div className="min-w-0">
                        <Link className="text-base font-bold leading-7 text-text-strong hover:text-primary-accent-strong" href={`/products/${item.product.slug}`}>
                          {item.product.name}
                        </Link>
                        <p className="mt-1 text-xs font-medium text-text-muted">{item.product.brand.name}</p>
                        <p className="mt-2 text-xs text-text-muted sm:mt-3 sm:text-sm">قیمت واحد: {formatPrice(item.product.price)}</p>
                      </div>
                      <div className="flex flex-col gap-3 sm:items-end">
                        <PriceBlock amount={Number(item.product.price) * item.quantity} label="جمع این کالا" size="sm" />
                        <CartItemControls productId={item.productId} quantity={item.quantity} />
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <aside className="h-fit rounded-2xl border border-border bg-surface-secondary p-5 lg:sticky lg:top-28">
            <h2 className="text-lg font-extrabold text-text-strong">خلاصه سفارش</h2>
            <PriceBlock amount={subtotal} className="mt-5" label="مبلغ قابل پرداخت" size="lg" />
            <div className="mt-5 space-y-4 text-sm text-text-muted">
              <div className="flex justify-between">
                <span>جمع کل</span>
                <span className="font-bold text-text-strong">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>هزینه ارسال</span>
                <span>محاسبه در مرحله بعد</span>
              </div>
            </div>
            <Link className="btn-primary mt-6 w-full" href="/cart/checkout">
              ادامه فرایند خرید
            </Link>
            <p className="mt-4 text-xs leading-6 text-text-muted">تایید نهایی سفارش بعد از ورود اطلاعات ارسال و پرداخت انجام می‌شود.</p>
          </aside>
        </div>
      ) : (
        <EmptyState
          actionHref="/products"
          actionLabel="رفتن به فروشگاه"
          description="از صفحه محصولات بازدید کنید و کالای موردنظر را به سبد اضافه کنید."
          title="سبد خرید شما خالی است"
        />
      )}
    </div>
  );
}
