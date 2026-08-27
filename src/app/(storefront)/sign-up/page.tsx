import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
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
    <AuthPageShell
      description="اطلاعات تماس و آدرس شما برای خریدهای بعدی ذخیره می‌شود و پیگیری سفارش‌ها ساده‌تر خواهد بود."
      footer={(
        <>
          قبلا حساب دارید؟{" "}
          <Link
            href={callbackUrl ? `/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}` : "/sign-in"}
            className="font-bold text-primary-accent-strong hover:text-[#B45309]"
          >
            وارد شوید
          </Link>
        </>
      )}
      formDescription="مشخصات اصلی و کد تأیید پیامکی را وارد کنید."
      formTitle="ساخت حساب کاربری"
      title="حساب بسازید تا خرید و پیگیری سفارش ساده‌تر شود"
    >
        <SignUpForm callbackUrl={callbackUrl} />
    </AuthPageShell>
  );
}
