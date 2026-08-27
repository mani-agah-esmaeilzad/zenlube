import Link from "next/link";

import { cn } from "@/lib/utils";

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  href?: string;
  actionLabel?: string;
  compactOnMobile?: boolean;
};

export function SectionHeader({ title, subtitle, href, actionLabel = "مشاهده همه", compactOnMobile = false }: SectionHeaderProps) {
  return (
    <div className={cn("section-heading", compactOnMobile && "!flex-row !items-start")}>
      <div className="min-w-0 flex-1">
        <h2 className="section-title">{title}</h2>
        {subtitle ? <p className={cn("section-subtitle", compactOnMobile && "hidden sm:block")}>{subtitle}</p> : null}
      </div>
      {href ? (
        <Link className="inline-flex shrink-0 items-center gap-1.5 pt-1 text-xs font-extrabold text-primary-accent-strong sm:text-sm" href={href}>
          <span>{actionLabel}</span>
          <svg aria-hidden="true" className="size-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </Link>
      ) : null}
    </div>
  );
}
