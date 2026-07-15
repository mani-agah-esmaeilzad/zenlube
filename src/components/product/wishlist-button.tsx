"use client";

import type { SVGProps } from "react";
import { useState, useTransition } from "react";

import { toggleWishlistAction } from "@/actions/catalog";
import { cn } from "@/lib/utils";

type WishlistButtonProps = {
  productId: string;
  initialActive?: boolean;
  compact?: boolean;
  className?: string;
};

export function WishlistButton({
  productId,
  initialActive = false,
  compact = false,
  className,
}: WishlistButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [active, setActive] = useState(initialActive);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleClick = () => {
    startTransition(async () => {
      const result = await toggleWishlistAction(productId);
      if (!result.success) {
        setFeedback(result.message ?? "عملیات علاقه‌مندی انجام نشد.");
        return;
      }

      setActive(Boolean(result.active));
      setFeedback(result.message ?? null);
    });
  };

  if (compact) {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        aria-label={active ? "حذف از علاقه‌مندی‌ها" : "افزودن به علاقه‌مندی‌ها"}
        className={cn(
          "inline-flex size-9 items-center justify-center rounded-full border border-[#E7E8EE] bg-white transition hover:border-[#F5C56B]",
          active ? "text-[#DC2626]" : "text-[#667085]",
          className,
        )}
      >
        <HeartIcon className={cn("h-4 w-4", active ? "fill-current" : "")} />
      </button>
    );
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className={cn(
          "inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[16px] border px-5 py-2.5 text-sm font-extrabold transition",
          active
            ? "border-[#FECACA] bg-[#FFF1F3] text-[#B42318]"
            : "border-[#E7E8EE] bg-white text-[#171B23] hover:border-[#F5C56B] hover:text-[#D97706]",
          className,
        )}
      >
        <HeartIcon className={cn("h-4 w-4", active ? "fill-current" : "")} />
        {isPending ? "در حال ثبت..." : active ? "در علاقه‌مندی‌ها" : "افزودن به علاقه‌مندی‌ها"}
      </button>
      <span className="block text-center text-[11px] text-[#667085]" aria-live="polite">
        {feedback ?? " "}
      </span>
    </div>
  );
}

function HeartIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.8}
      viewBox="0 0 24 24"
      {...props}
    >
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
    </svg>
  );
}
