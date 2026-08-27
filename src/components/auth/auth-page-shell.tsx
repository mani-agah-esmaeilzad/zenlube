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
    <div className="container-zen py-5 sm:py-8 md:py-10 lg:flex lg:min-h-[72vh] lg:items-center">
      <div className="grid w-full overflow-hidden rounded-[20px] border border-border bg-white lg:grid-cols-[minmax(0,1fr)_480px]">
        <section className="relative overflow-hidden bg-primary p-5 text-white sm:p-8 lg:p-10">
          <span aria-hidden="true" className="absolute inset-y-0 right-0 w-1 bg-primary-accent" />
          <h1 className="max-w-2xl text-[1.65rem] font-black leading-[1.55] tracking-[-0.035em] sm:text-3xl lg:text-4xl">{title}</h1>
          <p className="mt-3 max-w-xl text-sm leading-8 text-white/70">{description}</p>
          <ul className="mt-5 grid gap-2 text-xs font-bold text-white/80 sm:grid-cols-3 lg:mt-8 lg:grid-cols-1">
            {accountFeatures.map((feature) => (
              <li key={feature} className="flex items-center gap-2">
                <span aria-hidden="true" className="size-1.5 rounded-full bg-primary-accent" />
                {feature}
              </li>
            ))}
          </ul>
        </section>

        <section className="p-4 sm:p-8 lg:p-10">
          <div className="mb-6">
            <h2 className="text-xl font-extrabold text-text-strong sm:text-2xl">{formTitle}</h2>
            <p className="mt-2 text-sm leading-7 text-text-muted">{formDescription}</p>
          </div>
          {children}
          <div className="mt-6 text-center text-xs text-text-muted">{footer}</div>
        </section>
      </div>
    </div>
  );
}
