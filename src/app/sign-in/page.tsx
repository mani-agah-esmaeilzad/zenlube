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
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-16">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-500/10">
        <h1 className="text-2xl font-semibold text-slate-900">ورود به ZenLube</h1>
        <p className="mt-2 text-sm text-slate-600">برای مدیریت سبد خرید و دسترسی به پنل ادمین وارد شوید.</p>
        {registered && (
          <p className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-700">
            حساب شما با موفقیت ایجاد شد. لطفاً با ایمیل و رمز عبور وارد شوید.
          </p>
        )}
        <div className="mt-8">
          <SignInForm callbackUrl={callbackUrl} registered={registered} />
        </div>
        <p className="mt-6 text-center text-xs text-slate-500">
          کاربر جدید هستید؟ <Link href={signUpLink} className="text-sky-600 hover:text-sky-700">ثبت‌نام کنید</Link>
        </p>
      </div>
    </div>
  );
}
