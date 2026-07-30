import Link from "next/link";
import { redirect } from "next/navigation";

import { AdminSignInForm } from "@/components/admin/admin-sign-in-form";
import { getAppSession } from "@/lib/session";

type AdminLoginPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const session = await getAppSession();
  const params = await searchParams;
  const callbackUrl = typeof params?.callbackUrl === "string" ? params.callbackUrl : undefined;

  if ((session as { user?: { role?: string } } | null)?.user?.role === "ADMIN") {
    redirect(callbackUrl ?? "/admin");
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-16">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-500/10">
        <h1 className="text-2xl font-semibold text-slate-900">ورود به پنل ادمین</h1>
        <p className="mt-2 text-sm text-slate-600">برای مدیریت محتوا، سفارش‌ها و موجودی وارد شوید.</p>
        <div className="mt-8">
          <AdminSignInForm callbackUrl={callbackUrl} />
        </div>
        <p className="mt-6 text-center text-xs text-slate-500">
          کاربر معمولی هستید؟{" "}
          <Link href={callbackUrl ? `/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}` : "/sign-in"} className="text-sky-600 hover:text-sky-700">
            از اینجا وارد شوید
          </Link>
        </p>
      </div>
    </div>
  );
}
