import Link from "next/link";

import { cn } from "@/lib/utils";

type EmptyStateProps = {
  title: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
  className?: string;
  compact?: boolean;
};

export function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
  className,
  compact = false,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "panel-zen-muted rounded-2xl border-dashed text-center",
        compact ? "p-6 sm:p-7" : "p-8 sm:p-10",
        className,
      )}
    >
      <div className="icon-shell mx-auto flex size-14 items-center justify-center rounded-full">
        <EmptySparkIcon className="h-7 w-7" />
      </div>
      <h2 className="mt-4 text-lg font-extrabold text-text-strong sm:text-xl">{title}</h2>
      {description ? <p className="mt-2 text-sm leading-7 text-text-muted">{description}</p> : null}
      {actionHref && actionLabel ? (
        <Link href={actionHref} className="btn-primary mt-5 inline-flex">
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}

function EmptySparkIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.8}
      viewBox="0 0 24 24"
    >
      <path d="M12 3v4" />
      <path d="M12 17v4" />
      <path d="M3 12h4" />
      <path d="M17 12h4" />
      <path d="m5.8 5.8 2.8 2.8" />
      <path d="m15.4 15.4 2.8 2.8" />
      <path d="m18.2 5.8-2.8 2.8" />
      <path d="m8.6 15.4-2.8 2.8" />
      <circle cx="12" cy="12" r="3.5" />
    </svg>
  );
}
