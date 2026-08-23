"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { clearCartAction, removeCartItemAction, updateCartItemAction } from "@/actions/cart";
import { cn } from "@/lib/utils";

type CartItemControlsProps = {
  productId: string;
  quantity: number;
};

export function CartItemControls({ productId, quantity }: CartItemControlsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const updateQuantity = (nextQuantity: number) => {
    startTransition(async () => {
      await updateCartItemAction({ productId, quantity: nextQuantity });
      router.refresh();
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center overflow-hidden rounded-xl border border-border bg-white">
        <button
          type="button"
          aria-label="کم کردن تعداد"
          onClick={() => updateQuantity(quantity - 1)}
          disabled={isPending || quantity <= 1}
          className={cn("flex h-11 w-11 items-center justify-center text-lg font-bold text-text-muted hover:bg-surface-elevated", isPending && "opacity-50")}
        >
          -
        </button>
        <span className="flex h-11 min-w-10 items-center justify-center border-x border-border px-2 text-sm font-bold text-text-strong">
          {quantity.toLocaleString("fa-IR")}
        </span>
        <button
          type="button"
          aria-label="زیاد کردن تعداد"
          onClick={() => updateQuantity(quantity + 1)}
          disabled={isPending}
          className={cn("flex h-11 w-11 items-center justify-center text-lg font-bold text-text-muted hover:bg-surface-elevated", isPending && "opacity-50")}
        >
          +
        </button>
      </div>
      <button
        type="button"
        onClick={() =>
          startTransition(async () => {
            await removeCartItemAction(productId);
            router.refresh();
          })
        }
        className="rounded-xl border border-[#FECACA] px-3 py-2 text-xs font-bold text-error hover:bg-[#FEF3F2]"
        disabled={isPending}
      >
        حذف
      </button>
    </div>
  );
}

export function ClearCartButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      onClick={() =>
        startTransition(async () => {
          await clearCartAction();
          router.refresh();
        })
      }
      className="btn-outline !min-h-11 rounded-xl text-xs disabled:opacity-60"
      disabled={isPending}
    >
      خالی کردن سبد
    </button>
  );
}
