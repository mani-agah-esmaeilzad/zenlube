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
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16 sm:px-6">
      <div className="rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6">
          <p className="text-sm font-bold text-[#DC2626]">Oilbar</p>
          <h1 className="mt-2 text-2xl font-extrabold text-[#111827]">ورود به حساب کاربری</h1>
          <p className="mt-2 text-sm leading-7 text-[#6B7280]">
            برای مدیریت سبد خرید، سفارش‌ها، خودروهای ذخیره‌شده و دسترسی به پنل ادمین وارد شوید.
          </p>
        </div>
        {registered && (
          <p className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs leading-6 text-emerald-700">
            حساب شما با موفقیت ایجاد شد. با وارد کردن شماره موبایل و دریافت کد تایید وارد شوید.
          </p>
        )}
        <SignInForm callbackUrl={callbackUrl} />
        <p className="mt-6 text-center text-xs text-slate-500">
          کاربر جدید هستید؟{" "}
          <Link href={signUpLink} className="font-bold text-[#DC2626] hover:text-[#B91C1C]">
            ثبت‌نام کنید
          </Link>
        </p>
      </div>
    </div>
  );
}
