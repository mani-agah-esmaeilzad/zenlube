"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import {
  clearCartAction,
  removeCartItemAction,
  updateCartItemAction,
} from "@/actions/cart";
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
      <button
        type="button"
        onClick={() => updateQuantity(quantity - 1)}
        disabled={isPending || quantity <= 1}
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-full border border-white/20 text-lg text-white/80",
          isPending && "opacity-50",
        )}
      >
        –
      </button>
      <span className="text-sm text-white/80">{quantity}</span>
      <button
        type="button"
        onClick={() => updateQuantity(quantity + 1)}
        disabled={isPending}
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-full border border-white/20 text-lg text-white/80",
          isPending && "opacity-50",
        )}
      >
        +
      </button>
      <button
        type="button"
        onClick={() =>
          startTransition(async () => {
            await removeCartItemAction(productId);
            router.refresh();
          })
        }
        className="text-xs text-white/60 hover:text-red-300"
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
      className="rounded-full border border-white/15 px-4 py-2 text-xs text-white/70 hover:border-red-300 hover:text-red-200 disabled:opacity-60"
      disabled={isPending}
    >
      خالی کردن سبد
    </button>
  );
}
