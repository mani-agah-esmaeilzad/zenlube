"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { FormEvent, useState, useTransition } from "react";

type SignInFormProps = {
  callbackUrl?: string;
  registered?: boolean;
};

export function SignInForm({ callbackUrl }: SignInFormProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const resolvedCallback = callbackUrl ?? searchParams.get("callbackUrl") ?? "/account";

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
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: resolvedCallback,
      });

      if (result?.error) {
        setError("اطلاعات ورود صحیح نیست.");
        return;
      }

      router.replace(resolvedCallback);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="email" className="text-xs font-semibold text-slate-600">
          ایمیل
        </label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          className="w-full rounded-full border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-sky-300"
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
          className="w-full rounded-full border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-sky-300"
        />
      </div>
      {error && <p className="text-xs text-red-300">{error}</p>}
      <button
        type="submit"
        className="w-full rounded-full bg-sky-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-600 disabled:opacity-60"
        disabled={isPending}
      >
        {isPending ? "در حال ورود..." : "ورود"}
      </button>
      <p className="text-center text-xs text-slate-500">
        ادمین نمونه: admin@oilbar.ir | Admin@123
      </p>
    </form>
  );
}
