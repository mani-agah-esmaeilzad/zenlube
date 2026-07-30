import { cn, formatPrice } from "@/lib/utils";

type PriceBlockProps = {
  amount: number | string | { toString(): string };
  label?: string;
  align?: "start" | "end";
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeMap = {
  sm: {
    amount: "text-sm sm:text-base",
    label: "text-[11px]",
  },
  md: {
    amount: "text-lg sm:text-xl",
    label: "text-xs",
  },
  lg: {
    amount: "text-2xl sm:text-3xl",
    label: "text-sm",
  },
} as const;

export function PriceBlock({
  amount,
  label = "قیمت",
  align = "end",
  size = "md",
  className,
}: PriceBlockProps) {
  return (
    <div className={cn(align === "end" ? "text-left" : "text-right", className)}>
      <p className={cn("font-medium text-text-muted", sizeMap[size].label)}>{label}</p>
      <p className={cn("mt-1 font-black text-text-strong", sizeMap[size].amount)}>{formatPrice(amount)}</p>
    </div>
  );
}
