"use client";

import { useState, useTransition } from "react";
import { addToCartAction } from "@/actions/cart";
import { cn } from "@/lib/utils";

type AddToCartButtonProps = {
  productId: string;
  className?: string;
};

export function AddToCartButton({ productId, className }: AddToCartButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() =>
          startTransition(async () => {
            setFeedback(null);
            const result = await addToCartAction({ productId, quantity: 1 });
            if (!result?.success) {
              setFeedback(result?.message ?? "افزودن به سبد با خطا مواجه شد.");
            } else {
              setFeedback("به سبد خرید اضافه شد.");
            }
          })
        }
        className={cn(
          "w-full rounded-full bg-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-sky-300/40 transition hover:bg-sky-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-200 disabled:cursor-not-allowed disabled:opacity-60",
          className,
        )}
        disabled={isPending}
      >
        {isPending ? "در حال افزودن..." : "افزودن به سبد"}
      </button>
      {feedback && (
        <span className="text-center text-xs text-sky-600/80">{feedback}</span>
      )}
    </div>
  );
}
