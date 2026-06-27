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
    <div className="flex items-center gap-3">
      <div className="flex items-center overflow-hidden rounded-xl border border-[#E5E7EB] bg-white">
        <button
          type="button"
          aria-label="کم کردن تعداد"
          onClick={() => updateQuantity(quantity - 1)}
          disabled={isPending || quantity <= 1}
          className={cn("flex h-9 w-9 items-center justify-center text-lg font-bold text-[#6B7280] hover:bg-[#F7F7F8]", isPending && "opacity-50")}
        >
          -
        </button>
        <span className="flex h-9 min-w-9 items-center justify-center border-x border-[#E5E7EB] text-sm font-bold text-[#111827]">
          {quantity.toLocaleString("fa-IR")}
        </span>
        <button
          type="button"
          aria-label="زیاد کردن تعداد"
          onClick={() => updateQuantity(quantity + 1)}
          disabled={isPending}
          className={cn("flex h-9 w-9 items-center justify-center text-lg font-bold text-[#6B7280] hover:bg-[#F7F7F8]", isPending && "opacity-50")}
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
        className="text-xs font-bold text-[#DC2626] hover:text-[#EF394E]"
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
      className="btn-outline !min-h-10 text-xs disabled:opacity-60"
      disabled={isPending}
    >
      خالی کردن سبد
    </button>
  );
}
