"use client";

import type { SVGProps } from "react";
import { useState, useTransition } from "react";
import { addToCartAction } from "@/actions/cart";
import { useToast } from "@/components/ui/toast-provider";
import { cn } from "@/lib/utils";

type AddToCartButtonProps = {
  productId: string;
  className?: string;
  disabled?: boolean;
  quantity?: number;
  size?: "sm" | "md" | "lg";
};

const sizeStyles = {
  sm: "min-h-10 rounded-[14px] px-4 py-2 text-[13px]",
  md: "min-h-11 rounded-[16px] px-5 py-2.5 text-sm",
  lg: "min-h-[50px] rounded-[18px] px-6 py-3 text-sm sm:text-base",
} as const;

export function AddToCartButton({
  productId,
  className,
  disabled = false,
  quantity = 1,
  size = "md",
}: AddToCartButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackTone, setFeedbackTone] = useState<"success" | "error">("success");
  const { showToast } = useToast();
  const isDisabled = disabled || isPending;

  const handleAdd = () => {
    if (isDisabled) {
      return;
    }
    startTransition(async () => {
      setFeedback(null);
      const result = await addToCartAction({ productId, quantity });
      if (!result?.success) {
        const message = result?.message ?? "افزودن به سبد با خطا مواجه شد.";
        setFeedbackTone("error");
        setFeedback(message);
        showToast(message, "error");
      } else {
        const message = quantity > 1 ? `${quantity.toLocaleString("fa-IR")} عدد به سبد اضافه شد.` : "محصول به سبد اضافه شد.";
        setFeedbackTone("success");
        setFeedback(message);
        showToast(message, "success");
      }
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handleAdd}
        className={cn(
          "btn-primary inline-flex items-center justify-center gap-2 font-extrabold disabled:cursor-not-allowed disabled:border-[#D0D5DD] disabled:bg-[#EAECF0] disabled:text-[#98A2B3] disabled:shadow-none",
          sizeStyles[size],
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
          "text-center text-[11px] leading-5",
          feedback ? (feedbackTone === "success" ? "text-success" : "text-danger") : "text-transparent",
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
