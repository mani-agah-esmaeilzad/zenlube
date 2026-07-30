"use client";

import { cn } from "@/lib/utils";

type QuantitySelectorProps = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  className?: string;
  size?: "sm" | "md";
};

export function QuantitySelector({
  value,
  onChange,
  min = 1,
  max,
  disabled = false,
  className,
  size = "md",
}: QuantitySelectorProps) {
  const decrementDisabled = disabled || value <= min;
  const incrementDisabled = disabled || (typeof max === "number" ? value >= max : false);

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-[20px] border border-border bg-[linear-gradient(180deg,#FFFFFF_0%,#FCFCFD_100%)] shadow-[0_10px_24px_rgba(17,24,39,0.04)]",
        size === "sm" ? "min-h-10" : "min-h-12",
        className,
      )}
    >
      <button
        aria-label="کاهش تعداد"
        className={cn(
          "inline-flex items-center justify-center text-text-strong transition hover:bg-surface-elevated disabled:text-text-soft",
          size === "sm" ? "h-10 w-10 text-lg" : "h-12 w-12 text-xl",
        )}
        disabled={decrementDisabled}
        onClick={() => onChange(Math.max(min, value - 1))}
        type="button"
      >
        −
      </button>
      <div
        aria-live="polite"
        className={cn(
          "flex min-w-0 items-center justify-center border-x border-border/70 px-3 font-bold text-text-strong",
          size === "sm" ? "min-w-10 text-sm" : "min-w-12 text-base",
        )}
      >
        {value.toLocaleString("fa-IR")}
      </div>
      <button
        aria-label="افزایش تعداد"
        className={cn(
          "inline-flex items-center justify-center text-text-strong transition hover:bg-surface-elevated disabled:text-text-soft",
          size === "sm" ? "h-10 w-10 text-lg" : "h-12 w-12 text-xl",
        )}
        disabled={incrementDisabled}
        onClick={() => onChange(typeof max === "number" ? Math.min(max, value + 1) : value + 1)}
        type="button"
      >
        +
      </button>
    </div>
  );
}
