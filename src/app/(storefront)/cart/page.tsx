import Link from "next/link";

import { CartItemControls, ClearCartButton } from "@/components/cart/cart-item-controls";
import { EmptyState } from "@/components/ui/empty-state";
import { PriceBlock } from "@/components/ui/price-block";
import { StorefrontPageIntro } from "@/components/ui/storefront-page-intro";
import prisma from "@/lib/prisma";
import { resolveProductPricing } from "@/lib/pricing";
import { formatPrice } from "@/lib/utils";
import { getAppSession } from "@/lib/session";

export default async function CartPage() {
  const rawSession = await getAppSession();
  const userId = (rawSession as { user?: { id?: string } } | null)?.user?.id;

  if (!userId) {
    return (
      <div className="container-zen space-y-6 py-5 sm:py-6 md:space-y-8 md:py-8">
        <StorefrontPageIntro
          compact
          description="پس از ورود، کالاهای انتخاب‌شده و خلاصهٔ پرداخت در همین صفحه نمایش داده می‌شود."
          title="سبد خرید"
          tone="dark"
        />
        <div className="mx-auto w-full max-w-2xl">
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
    include: { items: { include: { product: { include: { brand: true, promotion: true } } } } },
  });

  const subtotal = cart?.items.reduce(
    (sum, item) => sum + resolveProductPricing(item.product).effectivePrice * item.quantity,
    0,
  ) ?? 0;

  return (
    <div className="container-zen space-y-5 py-5 sm:space-y-6 sm:py-6 md:py-8">
      <StorefrontPageIntro
        actions={cart?.items?.length ? <ClearCartButton /> : undefined}
        compact
        description="محصولات انتخاب‌شده را بررسی کنید و سپس وارد مرحلهٔ ارسال و پرداخت شوید."
        meta={`${(cart?.items?.length ?? 0).toLocaleString("fa-IR")} ردیف کالا`}
        title="سبد خرید"
      />

      {cart?.items?.length ? (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px] xl:gap-8">
          <div className="divide-y divide-border border-t border-border bg-white">
            {cart.items.map((item) => {
              const pricing = resolveProductPricing(item.product);
              return (
              <article key={item.id} className="py-4 sm:py-5">
                <div className={item.product.imageUrl ? "grid grid-cols-[72px_minmax(0,1fr)] gap-3 sm:grid-cols-[88px_minmax(0,1fr)] sm:gap-4" : "grid grid-cols-1"}>
                  {item.product.imageUrl ? (
                    <Link className="relative aspect-square overflow-hidden rounded-lg bg-surface-secondary" href={`/products/${item.product.slug}`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img alt={item.product.name} className="h-full w-full object-contain p-2" src={item.product.imageUrl} />
                    </Link>
                  ) : null}
                  <div className="min-w-0">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                      <div className="min-w-0">
                        <Link className="inline-flex min-h-11 items-center text-base font-bold leading-7 text-text-strong hover:text-primary-accent-strong" href={`/products/${item.product.slug}`}>
                          {item.product.name}
                        </Link>
                        <p className="mt-1 text-xs font-medium text-text-muted">{item.product.brand.name}</p>
                        {pricing.hasDiscount ? (
                          <del className="mt-2 block text-[11px] font-bold text-text-soft">{formatPrice(pricing.basePrice)}</del>
                        ) : null}
                        <p className="mt-1 text-xs text-text-muted sm:text-sm">قیمت واحد: {formatPrice(pricing.effectivePrice)}</p>
                      </div>
                      <div className="flex flex-col gap-3 sm:items-end">
                        <PriceBlock amount={pricing.effectivePrice * item.quantity} label="جمع این کالا" size="sm" />
                        <CartItemControls productId={item.productId} quantity={item.quantity} />
                      </div>
                    </div>
                  </div>
                </div>
              </article>
              );
            })}
          </div>

          <aside className="h-fit border-t border-border pt-5 lg:sticky lg:top-28 lg:border-t-0 lg:border-r lg:px-5 lg:py-0">
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
            <Link className="btn-primary mt-6 !min-h-11 w-full" href="/cart/checkout">
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
