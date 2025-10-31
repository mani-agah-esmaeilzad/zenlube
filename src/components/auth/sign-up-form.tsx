"use client";

import { useEffect, useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { registerUserAction } from "@/actions/auth";

type SignUpFormProps = {
  callbackUrl?: string;
};

const registerInitialState: Awaited<ReturnType<typeof registerUserAction>> = {
  success: false,
  fieldErrors: {},
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className="w-full rounded-full bg-sky-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-600 disabled:opacity-60"
      disabled={pending}
    >
      {pending ? "در حال ثبت‌نام..." : "ایجاد حساب"}
    </button>
  );
}

export function SignUpForm({ callbackUrl }: SignUpFormProps) {
  const router = useRouter();
  const [state, formAction] = useActionState(registerUserAction, registerInitialState);

  useEffect(() => {
    if (state?.success) {
      const params = new URLSearchParams();
      params.set("registered", "1");
      if (callbackUrl) {
        params.set("callbackUrl", callbackUrl);
      }
      router.replace(`/sign-in?${params.toString()}`);
    }
  }, [state?.success, callbackUrl, router]);

  const fieldErrors = state?.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="name" className="text-xs font-semibold text-slate-600">
          نام و نام خانوادگی
        </label>
        <input
          id="name"
          name="name"
          required
          minLength={2}
          className="w-full rounded-full border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-sky-300"
        />
        {fieldErrors.name?.map((error) => (
          <p key={error} className="text-xs text-red-500">
            {error}
          </p>
        ))}
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="text-xs font-semibold text-slate-600">
          ایمیل
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full rounded-full border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-sky-300"
        />
        {fieldErrors.email?.map((error) => (
          <p key={error} className="text-xs text-red-500">
            {error}
          </p>
        ))}
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-xs font-semibold text-slate-600">
          رمز عبور
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          className="w-full rounded-full border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-sky-300"
        />
        {fieldErrors.password?.map((error) => (
          <p key={error} className="text-xs text-red-500">
            {error}
          </p>
        ))}
      </div>

      <div className="space-y-2">
        <label htmlFor="confirmPassword" className="text-xs font-semibold text-slate-600">
          تکرار رمز عبور
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          minLength={8}
          className="w-full rounded-full border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-sky-300"
        />
        {fieldErrors.confirmPassword?.map((error) => (
          <p key={error} className="text-xs text-red-500">
            {error}
          </p>
        ))}
      </div>

      {state?.message && !state.success && (
        <p className="text-xs text-red-500">{state.message}</p>
      )}

      <SubmitButton />
    </form>
  );
}
