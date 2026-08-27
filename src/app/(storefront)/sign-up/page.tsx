import Link from "next/link";
import { redirect } from "next/navigation";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { getAppSession } from "@/lib/session";

type SignUpPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const session = await getAppSession();
  const params = await searchParams;
  const callbackUrl = typeof params?.callbackUrl === "string" ? params.callbackUrl : undefined;

  if (session) {
    redirect(callbackUrl ?? "/account");
  }

  return (
    <div className="container-zen py-5 sm:py-8 md:py-10 lg:flex lg:min-h-[70vh] lg:items-center">
      <div className="grid w-full gap-6 lg:grid-cols-[1.05fr_480px]">
        <section className="hidden rounded-2xl bg-surface-secondary p-10 lg:block">
          <p className="text-sm font-bold text-primary-accent-strong">شروع خرید</p>
          <h1 className="mt-4 text-4xl font-black leading-[1.5] text-text-strong">حساب بسازید تا خرید و پیگیری سفارش ساده‌تر شود</h1>
          <p className="mt-4 max-w-xl text-sm leading-8 text-text-muted">
            با ثبت‌نام در Oilbar، اطلاعات تماس و آدرس شما ذخیره می‌شود و برای سفارش‌های بعدی سریع‌تر به پرداخت می‌رسید.
          </p>
        </section>
        <div className="mx-auto w-full max-w-[34rem] bg-white py-2 sm:rounded-2xl sm:border sm:border-border sm:p-8 lg:max-w-none">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-text-strong">ساخت حساب کاربری</h1>
          <p className="mt-2 text-sm leading-8 text-text-muted">
            با ثبت‌نام در Oilbar، سبد خرید، سفارش‌ها و پیشنهادهای مناسب خودروی خود را مدیریت کنید.
          </p>
        </div>
        <SignUpForm callbackUrl={callbackUrl} />
        <p className="mt-6 text-center text-xs text-text-muted">
          قبلا حساب دارید؟{" "}
          <Link
            href={callbackUrl ? `/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}` : "/sign-in"}
            className="font-bold text-primary-accent-strong hover:text-[#B45309]"
          >
            وارد شوید
          </Link>
        </p>
        </div>
      </div>
    </div>
  );
}
