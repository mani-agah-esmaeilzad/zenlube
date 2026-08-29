import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
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
    <AuthPageShell
      description="بعد از ورود، سفارش‌ها، آدرس‌های ذخیره‌شده و سبد خریدتان از یک مسیر در دسترس است."
      footer={(
        <>
          کاربر جدید هستید؟{" "}
          <Link href={signUpLink} className="font-bold text-primary-accent-strong hover:text-[#B45309]">
            ثبت‌نام کنید
          </Link>
        </>
      )}
      formDescription="شمارهٔ موبایل را وارد کنید و با کد تأیید پیامکی ادامه دهید."
      formTitle="ورود به حساب کاربری"
      title="ورود برای مدیریت سفارش و سبد خرید"
    >
        {registered && (
          <p className="mb-5 border-r-2 border-emerald-500 px-3 py-2 text-xs leading-6 text-emerald-700">
            حساب شما با موفقیت ایجاد شد. با وارد کردن شماره موبایل و دریافت کد تایید وارد شوید.
          </p>
        )}
        <SignInForm callbackUrl={callbackUrl} />
    </AuthPageShell>
  );
}
