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
    <div className="container-zen flex min-h-[70vh] max-w-[1180px] items-center py-10">
      <div className="grid w-full gap-6 lg:grid-cols-[1.05fr_480px]">
        <section className="hidden rounded-[34px] bg-white p-10 shadow-[0_24px_60px_rgba(17,24,39,0.12)] lg:block">
          <p className="text-sm font-bold text-[#D97706]">شروع خرید هوشمند</p>
          <h1 className="mt-4 text-4xl font-black leading-[1.5] text-[#171B23]">حساب بسازید تا خرید، پیگیری سفارش و انتخاب روغن ساده‌تر شود</h1>
          <p className="mt-4 max-w-xl text-sm leading-8 text-[#667085]">
            با ثبت‌نام در Oilbar، اطلاعات تماس و آدرس شما ذخیره می‌شود و برای سفارش‌های بعدی سریع‌تر به مرحله پرداخت می‌رسید.
          </p>
        </section>
        <div className="rounded-[30px] border border-[#E7E8EE] bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.07)] sm:p-8">
        <div className="mb-6">
          <p className="text-sm font-bold text-[#D97706]">Oilbar</p>
          <h1 className="mt-2 text-2xl font-extrabold text-[#171B23]">ساخت حساب کاربری</h1>
          <p className="mt-2 text-sm leading-8 text-[#667085]">
            با ثبت‌نام در Oilbar، سبد خرید، سفارش‌ها و پیشنهادهای مناسب خودروی خود را مدیریت کنید.
          </p>
        </div>
        <SignUpForm callbackUrl={callbackUrl} />
        <p className="mt-6 text-center text-xs text-[#667085]">
          قبلا حساب دارید؟{" "}
          <Link
            href={callbackUrl ? `/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}` : "/sign-in"}
            className="font-bold text-[#D97706] hover:text-[#B45309]"
          >
            وارد شوید
          </Link>
        </p>
      </div>
      </div>
    </div>
  );
}
