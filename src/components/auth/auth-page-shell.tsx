import type { ReactNode } from "react";

type AuthPageShellProps = {
  title: string;
  description: string;
  formTitle: string;
  formDescription: string;
  children: ReactNode;
  footer: ReactNode;
};

const accountFeatures = ["پیگیری سفارش‌ها", "مدیریت آدرس و خودرو", "خرید سریع‌تر در دفعات بعد"];

export function AuthPageShell({
  title,
  description,
  formTitle,
  formDescription,
  children,
  footer,
}: AuthPageShellProps) {
  return (
    <div className="container-zen py-5 sm:py-8 md:py-10 lg:flex lg:min-h-[70vh] lg:items-center">
      <div className="grid w-full border-y border-border bg-white lg:grid-cols-[minmax(0,1fr)_440px]">
        <section className="relative overflow-hidden bg-primary px-5 py-6 text-white sm:px-8 sm:py-8 lg:px-10 lg:py-12">
          <span aria-hidden="true" className="absolute inset-y-0 right-0 w-1 bg-primary-accent" />
          <h1 className="max-w-2xl text-[1.45rem] font-black leading-[1.55] tracking-[-0.035em] sm:text-2xl lg:text-3xl">{title}</h1>
          <p className="mt-3 max-w-xl text-sm leading-8 text-white/70">{description}</p>
          <ul className="mt-5 divide-y divide-white/10 border-y border-white/10 text-xs font-bold text-white/80 lg:mt-8">
            {accountFeatures.map((feature) => (
              <li key={feature} className="flex min-h-11 items-center gap-2 py-2">
                <span aria-hidden="true" className="h-4 w-0.5 bg-primary-accent" />
                {feature}
              </li>
            ))}
          </ul>
        </section>

        <section className="border-t border-border px-1 py-6 sm:px-6 sm:py-8 lg:border-r lg:border-t-0 lg:px-8 lg:py-10">
          <div className="mb-6">
            <h2 className="text-xl font-extrabold text-text-strong sm:text-2xl">{formTitle}</h2>
            <p className="mt-2 text-sm leading-7 text-text-muted">{formDescription}</p>
          </div>
          {children}
          <div className="mt-6 border-t border-border pt-5 text-center text-xs text-text-muted">{footer}</div>
        </section>
      </div>
    </div>
  );
}
