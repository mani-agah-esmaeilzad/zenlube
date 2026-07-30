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
        "rounded-[28px] border border-[#E5E7EB] bg-white shadow-[0_16px_40px_rgba(15,23,42,0.07)]",
        compact ? "p-4" : "p-5",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <PriceBlock amount={price} size={compact ? "md" : "lg"} />
        <StatusPill tone={isAvailable ? "success" : "danger"}>
          {isAvailable ? `${stock.toLocaleString("fa-IR")} عدد موجود` : "ناموجود"}
        </StatusPill>
      </div>

      <div className="mt-4 space-y-2 rounded-2xl bg-[#F7F8FA] p-4 text-xs leading-6 text-[#374151]">
        <p>ضمانت اصالت و سلامت فیزیکی کالا</p>
        <p>مشاوره تخصصی قبل از خرید</p>
        <p>ارسال سریع با بسته‌بندی امن</p>
        {estimatedDeliveryLabel ? <p className="font-bold text-[#D97706]">{estimatedDeliveryLabel}</p> : null}
      </div>

      <div className="mt-4">
        <AddToCartButton productId={productId} disabled={!isAvailable} className="w-full" />
      </div>

      <div className="mt-3 grid gap-2 min-[360px]:grid-cols-2">
        <WishlistButton productId={productId} initialActive={wishlistActive} />
        <Link href={compareHref} className="btn-outline w-full justify-center">
          افزودن به مقایسه
        </Link>
      </div>
    </section>
  );
}
