"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { AddToCartButton } from "@/components/product/add-to-cart-button";
import { QuantitySelector } from "@/components/product/quantity-selector";
import { WishlistButton } from "@/components/product/wishlist-button";
import { formatPrice } from "@/lib/utils";

type ProductPurchasePanelProps = {
  compareHref: string;
  estimatedDeliveryLabel?: string | null;
  isAvailable: boolean;
  price: number | string | { toString(): string };
  productId: string;
  stock: number;
  wishlistActive?: boolean;
};

const benefits = [
  "تضمین اصالت کالا",
  "ارسال به سراسر کشور",
  "بسته‌بندی مناسب برای حمل",
  "پشتیبانی برای انتخاب محصول",
] as const;

export function ProductPurchasePanel({
  compareHref,
  estimatedDeliveryLabel,
  isAvailable,
  price,
  productId,
  stock,
  wishlistActive = false,
}: ProductPurchasePanelProps) {
  const [quantity, setQuantity] = useState(1);
  const finalPrice = useMemo(() => formatPrice(price), [price]);

  return (
    <>
      <section className="rounded-xl bg-surface-tint p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-text-muted">قیمت نهایی</p>
            <p className="mt-2 text-2xl font-black text-text-strong sm:text-[2rem]">{finalPrice}</p>
            {estimatedDeliveryLabel ? (
              <p className="mt-2 text-xs font-bold text-success">{estimatedDeliveryLabel}</p>
            ) : null}
          </div>

          <span
            className={`inline-flex items-center gap-2 text-xs font-extrabold ${
              isAvailable ? "text-emerald-700" : "text-[#D92D20]"
            }`}
          >
            <span aria-hidden="true" className={`h-2 w-2 rounded-full ${isAvailable ? "bg-emerald-600" : "bg-[#D92D20]"}`} />
            {isAvailable ? `${stock.toLocaleString("fa-IR")} عدد موجود` : "ناموجود"}
          </span>
        </div>

        <div className="mt-5 flex flex-col gap-3 min-[430px]:flex-row">
          <QuantitySelector
            className="min-[430px]:shrink-0"
            disabled={!isAvailable}
            max={Math.max(stock, 1)}
            onChange={setQuantity}
            value={quantity}
          />
          <AddToCartButton className="w-full" disabled={!isAvailable} productId={productId} quantity={quantity} size="lg" />
        </div>

        <div className="mt-3 flex items-center gap-2">
          <Link
            aria-label="افزودن این محصول به مقایسه"
            className="inline-flex min-h-11 items-center px-2 text-sm font-extrabold text-primary-accent-strong transition hover:text-primary-accent"
            href={compareHref}
          >
            مقایسه
          </Link>
          <WishlistButton compact productId={productId} initialActive={wishlistActive} className="!size-11 !rounded-xl" />
          <button
            aria-label="اشتراک‌گذاری محصول"
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-white text-text transition hover:border-primary-accent hover:text-primary-accent-strong"
            onClick={() => {
              if (typeof navigator !== "undefined" && navigator.share) {
                navigator.share({ url: window.location.href }).catch(() => undefined);
              }
            }}
            type="button"
          >
            <ShareIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 grid gap-2 border-t border-[rgba(217,119,6,0.12)] pt-4 text-sm text-text min-[420px]:grid-cols-2">
          {benefits.map((benefit) => (
            <div key={benefit} className="flex items-center gap-2">
              <span className="icon-shell inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full">
                <CheckIcon className="h-4 w-4" />
              </span>
              <span>{benefit}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom,0px)+4.65rem)] z-40 lg:hidden">
        <div className="rounded-xl border border-border bg-white/96 px-3 py-2.5 shadow-[0_16px_36px_rgba(17,24,39,0.12)] backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="min-w-0 shrink-0">
              <p className="text-[11px] font-bold text-text-muted">قیمت</p>
              <p className="mt-1 text-sm font-black text-text-strong">{finalPrice}</p>
            </div>
            <AddToCartButton className="w-full" disabled={!isAvailable} productId={productId} quantity={quantity} size="md" />
          </div>
        </div>
      </div>
    </>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} viewBox="0 0 24 24">
      <path d="m5 13 4 4L19 7" />
    </svg>
  );
}

function ShareIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} viewBox="0 0 24 24">
      <path d="M16 8a3 3 0 1 0-2.7-4.3L7.9 7a3 3 0 0 0 0 4l5.4 3.3A3 3 0 1 0 14 16a3 3 0 0 0-.2-1l-5.3-3.2a3 3 0 0 0 0-3.6l5.4-3.2A3 3 0 0 0 16 8Z" />
    </svg>
  );
}
