import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type StorefrontPageIntroProps = {
  title: string;
  description?: string;
  meta?: ReactNode;
  actions?: ReactNode;
  tone?: "plain" | "soft" | "dark";
  className?: string;
  compact?: boolean;
};

export function StorefrontPageIntro({
  title,
  description,
  meta,
  actions,
  tone = "soft",
  className,
  compact = false,
}: StorefrontPageIntroProps) {
  const dark = tone === "dark";

  return (
    <header
      className={cn(
        "relative px-4 sm:px-5 md:px-6",
        compact ? "py-4 sm:py-5" : "py-5 sm:py-6 md:py-7",
        tone === "dark" && "overflow-hidden rounded-xl bg-primary text-white",
        tone === "soft" && "border-y border-border/80 bg-surface-secondary text-text-strong",
        tone === "plain" && "bg-white text-text-strong",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "absolute inset-y-0 right-0 w-1",
          dark ? "bg-primary-accent" : "bg-primary-accent-strong",
        )}
      />
      <div className="flex min-w-0 flex-col items-start gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-8">
        <div className="min-w-0 max-w-3xl">
          <h1
            className={cn(
              "font-black leading-[1.45] tracking-[-0.035em]",
              compact ? "text-[1.45rem] sm:text-2xl" : "text-[1.65rem] sm:text-3xl md:text-[2.15rem]",
              dark ? "text-white" : "text-text-strong",
            )}
          >
            {title}
          </h1>
          {description ? (
            <p className={cn("mt-3 text-sm leading-8 sm:text-[0.95rem]", dark ? "text-white/70" : "text-text-muted")}>
              {description}
            </p>
          ) : null}
          {meta ? (
            <div className={cn("mt-4 text-xs font-bold leading-7", dark ? "text-primary-accent" : "text-primary-accent-strong")}>
              {meta}
            </div>
          ) : null}
        </div>
        {actions ? <div className="flex max-w-full shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
    </header>
  );
}
