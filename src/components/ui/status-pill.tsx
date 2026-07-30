import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type StatusPillTone =
  | "success"
  | "warning"
  | "danger"
  | "neutral"
  | "dark";

const toneMap: Record<StatusPillTone, string> = {
  success: "chip-zen-success",
  warning: "chip-zen-warning",
  danger: "border border-[rgba(217,45,32,0.14)] bg-[#FEF3F2] text-[#D92D20]",
  neutral: "chip-zen-muted",
  dark: "chip-zen-dark",
};

type StatusPillProps = {
  children: ReactNode;
  tone?: StatusPillTone;
  className?: string;
};

export function StatusPill({ children, tone = "neutral", className }: StatusPillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold",
        toneMap[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
