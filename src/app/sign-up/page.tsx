import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { authOptions } from "@/lib/auth.config";

type SignUpPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const session = await getServerSession(authOptions);
  const params = await searchParams;
  const callbackUrl = typeof params?.callbackUrl === "string" ? params.callbackUrl : undefined;

  if (session) {
    redirect(callbackUrl ?? "/account");
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-16">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-xl">
        <h1 className="text-2xl font-semibold text-white">ساخت حساب ZenLube</h1>
        <p className="mt-2 text-sm text-white/60">با ثبت‌نام، سبد خرید، سفارش‌ها و پیشنهادهای اختصاصی خودروی خود را مدیریت کنید.</p>
        <div className="mt-8">
          <SignUpForm callbackUrl={callbackUrl} />
        </div>
        <p className="mt-6 text-center text-xs text-white/60">
          قبلاً حساب دارید؟ <Link href={callbackUrl ? `/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}` : "/sign-in"} className="text-purple-200 hover:text-purple-100">وارد شوید</Link>
        </p>
      </div>
    </div>
  );
}
