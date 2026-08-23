import Link from "next/link";

type BreadcrumbItem = {
  href?: string;
  label: string;
};

type BreadcrumbProps = {
  items: BreadcrumbItem[];
};

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="مسیر صفحه" className="overflow-x-auto pb-1 text-xs font-medium text-text-muted scrollbar-none">
      <ol className="flex min-w-max items-center gap-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-2">
              {item.href && !isLast ? (
                <Link className="transition hover:text-primary-accent-strong" href={item.href}>
                  {item.label}
                </Link>
              ) : (
                <span className={isLast ? "text-text-strong" : undefined}>{item.label}</span>
              )}
              {!isLast ? (
                <span aria-hidden="true" className="text-text-soft">
                  /
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
