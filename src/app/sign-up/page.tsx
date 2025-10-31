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
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-16">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-500/10">
        <h1 className="text-2xl font-semibold text-slate-900">ساخت حساب ZenLube</h1>
        <p className="mt-2 text-sm text-slate-600">با ثبت‌نام، سبد خرید، سفارش‌ها و پیشنهادهای اختصاصی خودروی خود را مدیریت کنید.</p>
        <div className="mt-8">
          <SignUpForm callbackUrl={callbackUrl} />
        </div>
        <p className="mt-6 text-center text-xs text-slate-500">
          قبلاً حساب دارید؟ <Link href={callbackUrl ? `/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}` : "/sign-in"} className="text-sky-600 hover:text-sky-700">وارد شوید</Link>
        </p>
      </div>
    </div>
  );
}
