import Link from "next/link";
import { redirect } from "next/navigation";
import { SignInForm } from "@/components/auth/sign-in-form";
import { getAppSession } from "@/lib/session";

type SignInPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const session = await getAppSession();
  const params = await searchParams;
  const callbackUrl = typeof params?.callbackUrl === "string" ? params.callbackUrl : undefined;
  const registered = params?.registered === "1";

  if (session) {
    redirect(callbackUrl ?? "/account");
  }

  const signUpLink = callbackUrl
    ? `/sign-up?callbackUrl=${encodeURIComponent(callbackUrl)}`
    : "/sign-up";

  return (
    <div className="container-zen flex min-h-[70vh] max-w-[1180px] items-center py-10">
      <div className="grid w-full gap-6 lg:grid-cols-[1.05fr_480px]">
        <section className="hidden rounded-[34px] bg-[#171B23] p-10 text-white shadow-[0_24px_60px_rgba(17,24,39,0.18)] lg:block">
          <p className="text-sm font-bold text-[#F5C56B]">حساب کاربری Oilbar</p>
          <h1 className="mt-4 text-4xl font-black leading-[1.5]">ورود سریع برای مدیریت سفارش، سبد خرید و خودروهای ذخیره‌شده</h1>
          <p className="mt-4 max-w-xl text-sm leading-8 text-white/72">
            بعد از ورود، پیگیری سفارش، آدرس‌های ذخیره‌شده، پرداخت‌ها و پیشنهادهای متناسب با خودروی شما در یک داشبورد یکپارچه در دسترس است.
          </p>
        </section>
        <div className="rounded-[30px] border border-[#E7E8EE] bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.07)] sm:p-8">
        <div className="mb-6">
          <p className="text-sm font-bold text-[#D97706]">Oilbar</p>
          <h1 className="mt-2 text-2xl font-extrabold text-[#171B23]">ورود به حساب کاربری</h1>
          <p className="mt-2 text-sm leading-8 text-[#667085]">
            برای مدیریت سبد خرید، سفارش‌ها، خودروهای ذخیره‌شده و دسترسی به پنل ادمین وارد شوید.
          </p>
        </div>
        {registered && (
          <p className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs leading-6 text-emerald-700">
            حساب شما با موفقیت ایجاد شد. با وارد کردن شماره موبایل و دریافت کد تایید وارد شوید.
          </p>
        )}
        <SignInForm callbackUrl={callbackUrl} />
        <p className="mt-6 text-center text-xs text-[#667085]">
          کاربر جدید هستید؟{" "}
          <Link href={signUpLink} className="font-bold text-[#D97706] hover:text-[#B45309]">
            ثبت‌نام کنید
          </Link>
        </p>
      </div>
      </div>
    </div>
  );
}
