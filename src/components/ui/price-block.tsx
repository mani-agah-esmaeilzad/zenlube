import { cn, formatPrice } from "@/lib/utils";

type PriceBlockProps = {
  amount: number | string | { toString(): string };
  label?: string;
  showLabel?: boolean;
  align?: "start" | "end";
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeMap = {
  sm: {
    amount: "text-sm sm:text-[15px]",
    label: "text-[11px]",
  },
  md: {
    amount: "text-lg sm:text-xl",
    label: "text-xs",
  },
  lg: {
    amount: "text-2xl sm:text-[1.75rem]",
    label: "text-sm",
  },
} as const;

export function PriceBlock({
  amount,
  label = "قیمت",
  showLabel = true,
  align = "end",
  size = "md",
  className,
}: PriceBlockProps) {
  return (
    <div className={cn(align === "end" ? "text-left" : "text-right", className)}>
      {showLabel ? <p className={cn("font-medium text-text-muted", sizeMap[size].label)}>{label}</p> : null}
      <p className={cn("t-price", showLabel ? "mt-1" : null, sizeMap[size].amount)}>{formatPrice(amount)}</p>
    </div>
  );
}
