"use client";

import type { SVGProps } from "react";
import { useState, useTransition } from "react";
import { addToCartAction } from "@/actions/cart";
import { cn } from "@/lib/utils";

type AddToCartButtonProps = {
  productId: string;
  className?: string;
  disabled?: boolean;
};

export function AddToCartButton({ productId, className, disabled = false }: AddToCartButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);
  const isDisabled = disabled || isPending;

  const handleAdd = () => {
    if (isDisabled) {
      return;
    }
    startTransition(async () => {
      setFeedback(null);
      const result = await addToCartAction({ productId, quantity: 1 });
      if (!result?.success) {
        setFeedback(result?.message ?? "افزودن به سبد با خطا مواجه شد.");
      } else {
        setFeedback("محصول به سبد اضافه شد.");
      }
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handleAdd}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-l from-emerald-600 to-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_15px_30px_rgba(5,150,105,0.3)] transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-200 disabled:cursor-not-allowed disabled:opacity-70",
          className,
        )}
        disabled={isDisabled}
      >
        {disabled ? (
          "ناموجود"
        ) : isPending ? (
          <>
            <SpinnerIcon className="h-4 w-4 animate-spin" />
            در حال افزودن...
          </>
        ) : (
          <>
            <CartIcon className="h-4 w-4" />
            افزودن به سبد
          </>
        )}
      </button>
      <span
        className={cn(
          "text-center text-[11px]",
          feedback ? "text-emerald-500" : "text-transparent",
        )}
        aria-live="polite"
      >
        {feedback ? feedback : " "}
      </span>
    </div>
  );
}

function CartIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <circle cx={9} cy={20} r={1} />
      <circle cx={17} cy={20} r={1} />
      <path d="M3 4h2l2.4 12.2a1 1 0 001 .8h9.5a1 1 0 00.98-.8L21 8H7" />
    </svg>
  );
}

function SpinnerIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M12 2v4" />
      <path d="M12 18v4" />
      <path d="M4.93 4.93l2.83 2.83" />
      <path d="M16.24 16.24l2.83 2.83" />
      <path d="M2 12h4" />
      <path d="M18 12h4" />
      <path d="M4.93 19.07l2.83-2.83" />
      <path d="M16.24 7.76l2.83-2.83" />
    </svg>
  );
}
