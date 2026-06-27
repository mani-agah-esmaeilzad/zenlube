"use client";

import { FormEvent, useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

type AdminSignInFormProps = {
  callbackUrl?: string;
};

export function AdminSignInForm({ callbackUrl }: AdminSignInFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const resolvedCallback = callbackUrl ?? searchParams.get("callbackUrl") ?? "/admin";

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email")?.toString();
    const password = formData.get("password")?.toString();

    if (!email || !password) {
      setError("ایمیل و رمز عبور را وارد کنید.");
      return;
    }

    startTransition(async () => {
      setError(null);
      const result = await signIn("admin-credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: resolvedCallback,
      });

      if (result?.error) {
        setError("ورود ناموفق بود. ایمیل یا رمز عبور صحیح نیست.");
        return;
      }

      router.replace(resolvedCallback);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="email" className="text-xs font-semibold text-slate-600">
          ایمیل سازمانی
        </label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="admin@oilbar.ir"
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-slate-400"
          required
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="password" className="text-xs font-semibold text-slate-600">
          رمز عبور
        </label>
        <input
          id="password"
          name="password"
          type="password"
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-slate-400"
          required
        />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      <button
        type="submit"
        className="w-full rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
        disabled={isPending}
      >
        {isPending ? "در حال ورود..." : "ورود به پنل ادمین"}
      </button>
    </form>
  );
}
