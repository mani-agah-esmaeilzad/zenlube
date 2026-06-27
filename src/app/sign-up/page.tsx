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
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16 sm:px-6">
      <div className="rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6">
          <p className="text-sm font-bold text-[#DC2626]">Oilbar</p>
          <h1 className="mt-2 text-2xl font-extrabold text-[#111827]">ساخت حساب کاربری</h1>
          <p className="mt-2 text-sm leading-7 text-[#6B7280]">
            با ثبت‌نام در Oilbar، سبد خرید، سفارش‌ها و پیشنهادهای مناسب خودروی خود را مدیریت کنید.
          </p>
        </div>
        <SignUpForm callbackUrl={callbackUrl} />
        <p className="mt-6 text-center text-xs text-slate-500">
          قبلا حساب دارید؟{" "}
          <Link
            href={callbackUrl ? `/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}` : "/sign-in"}
            className="font-bold text-[#DC2626] hover:text-[#B91C1C]"
          >
            وارد شوید
          </Link>
        </p>
      </div>
    </div>
  );
}
