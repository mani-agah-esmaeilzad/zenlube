import Link from "next/link";

import { AddToCartButton } from "@/components/product/add-to-cart-button";
import { WishlistButton } from "@/components/product/wishlist-button";
import { PriceBlock } from "@/components/ui/price-block";
import { StatusPill } from "@/components/ui/status-pill";
import { cn } from "@/lib/utils";

type PurchaseBoxProps = {
  className?: string;
  compareHref?: string;
  compact?: boolean;
  estimatedDeliveryLabel?: string | null;
  isAvailable: boolean;
  price: number | string | { toString(): string };
  productId: string;
  stock: number;
  wishlistActive?: boolean;
};

export function PurchaseBox({
  className,
  compareHref = "/products/compare",
  compact = false,
  estimatedDeliveryLabel,
  isAvailable,
  price,
  productId,
  stock,
  wishlistActive = false,
}: PurchaseBoxProps) {
  return (
    <section
      className={cn(
        "border-y border-border bg-white",
        compact ? "py-4" : "py-5",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <PriceBlock amount={price} size={compact ? "md" : "lg"} />
        <StatusPill tone={isAvailable ? "success" : "danger"}>
          {isAvailable ? `${stock.toLocaleString("fa-IR")} عدد موجود` : "ناموجود"}
        </StatusPill>
      </div>

      <div className="mt-4 divide-y divide-border border-y border-border text-xs leading-6 text-[#374151]">
        <p className="py-2">ضمانت اصالت و سلامت فیزیکی کالا</p>
        <p className="py-2">مشاوره تخصصی قبل از خرید</p>
        <p className="py-2">ارسال سریع با بسته‌بندی امن</p>
        {estimatedDeliveryLabel ? <p className="py-2 font-bold text-[#D97706]">{estimatedDeliveryLabel}</p> : null}
      </div>

      <div className="mt-4">
        <AddToCartButton productId={productId} disabled={!isAvailable} className="w-full" />
      </div>

      <div className="mt-3 flex items-start gap-2">
        <WishlistButton compact className="!size-11 rounded-lg" productId={productId} initialActive={wishlistActive} />
        <Link href={compareHref} className="btn-ghost min-h-11 px-3 text-xs text-primary-accent-strong">
          افزودن به مقایسه
        </Link>
      </div>
    </section>
  );
}
