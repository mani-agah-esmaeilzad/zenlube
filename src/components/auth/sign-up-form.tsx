"use client";

import { useEffect, useActionState, useState, useTransition } from "react";
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
  const [otpMessage, setOtpMessage] = useState<string | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isOtpPending, startOtpTransition] = useTransition();

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

  const handleSendOtp = (form: HTMLFormElement | null) => {
    const phone = form ? (new FormData(form).get("phone") ?? "").toString() : "";
    setOtpMessage(null);
    setOtpError(null);
    if (!phone) {
      setOtpError("ابتدا شماره موبایل را وارد کنید.");
      return;
    }
    startOtpTransition(async () => {
      try {
        const response = await fetch("/api/auth/otp/request", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone, purpose: "account" }),
        });
        const data = await response.json();
        if (!response.ok || !data.success) {
          setOtpError(data.message ?? "ارسال کد با خطا مواجه شد.");
          return;
        }
        setOtpMessage("کد تایید ارسال شد. لطفاً ظرف ۵ دقیقه آن را وارد کنید.");
      } catch (error) {
        setOtpError(error instanceof Error ? error.message : "ارسال کد با خطا مواجه شد.");
      }
    });
  };

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
        <label htmlFor="phone" className="text-xs font-semibold text-slate-600">
          شماره موبایل
        </label>
        <div className="flex gap-2">
          <input
            id="phone"
            name="phone"
            type="tel"
            placeholder="09xxxxxxxxx"
            required
            className="w-full rounded-full border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-sky-300"
          />
          <button
            type="button"
            onClick={(event) => handleSendOtp(event.currentTarget.form)}
            className="shrink-0 rounded-full border border-sky-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-sky-400 hover:text-slate-800 disabled:opacity-60"
            disabled={isOtpPending}
          >
            {isOtpPending ? "در حال ارسال" : "ارسال کد"}
          </button>
        </div>
        {fieldErrors.phone?.map((error) => (
          <p key={error} className="text-xs text-red-500">
            {error}
          </p>
        ))}
      </div>

      <div className="space-y-2">
        <label htmlFor="otpCode" className="text-xs font-semibold text-slate-600">
          کد تایید پیامکی
        </label>
        <input
          id="otpCode"
          name="otpCode"
          inputMode="numeric"
          required
          className="w-full rounded-full border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-sky-300"
        />
        {fieldErrors.otpCode?.map((error) => (
          <p key={error} className="text-xs text-red-500">
            {error}
          </p>
        ))}
      </div>

      {otpMessage && <p className="text-xs text-emerald-600">{otpMessage}</p>}
      {otpError && <p className="text-xs text-red-500">{otpError}</p>}

      {state?.message && !state.success && (
        <p className="text-xs text-red-500">{state.message}</p>
      )}

      <SubmitButton />
    </form>
  );
}
