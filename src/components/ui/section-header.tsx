import Link from "next/link";

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  href?: string;
  actionLabel?: string;
};

export function SectionHeader({ title, subtitle, href, actionLabel = "مشاهده همه" }: SectionHeaderProps) {
  return (
    <div className="section-heading">
      <div>
        <h2 className="section-title">{title}</h2>
        {subtitle ? <p className="section-subtitle">{subtitle}</p> : null}
      </div>
      {href ? (
        <Link className="text-sm font-bold text-primary-accent-strong" href={href}>
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
