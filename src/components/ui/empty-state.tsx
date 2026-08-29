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
        "text-center",
        compact ? "px-3 py-5 sm:py-6" : "px-4 py-8 sm:py-10",
        className,
      )}
    >
      <EmptySparkIcon className="mx-auto h-7 w-7 text-primary-accent-strong" />
      <h2 className="mt-3 text-base font-extrabold text-text-strong sm:text-lg">{title}</h2>
      {description ? <p className="mx-auto mt-2 max-w-xl text-sm leading-7 text-text-muted">{description}</p> : null}
      {actionHref && actionLabel ? (
        <Link href={actionHref} className="text-link-zen mt-3 inline-flex min-h-11 items-center px-2 text-sm font-extrabold">
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
