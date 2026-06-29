"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { FormEvent, useState, useTransition } from "react";

type SignInFormProps = {
  callbackUrl?: string;
};

export function SignInForm({ callbackUrl }: SignInFormProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isOtpPending, startOtpTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [otpMessage, setOtpMessage] = useState<string | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);

  const resolvedCallback = callbackUrl ?? searchParams.get("callbackUrl") ?? "/account";

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const phone = formData.get("phone")?.toString();
    const otpCode = formData.get("otpCode")?.toString();

    if (!phone || !otpCode) {
      setError("شماره موبایل و کد تایید را وارد کنید.");
      return;
    }

    startTransition(async () => {
      setError(null);
      const result = await signIn("credentials", {
        phone,
        otpCode,
        redirect: false,
        callbackUrl: resolvedCallback,
      });

      if (result?.error) {
        setError("ورود با کد تایید ناموفق بود. دوباره تلاش کنید.");
        return;
      }

      router.replace(resolvedCallback);
    });
  };

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
      } catch (requestError) {
        setOtpError(requestError instanceof Error ? requestError.message : "ارسال کد با خطا مواجه شد.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="phone" className="text-xs font-bold text-[#475467]">
          شماره موبایل
        </label>
        <div className="flex gap-2">
          <input
            id="phone"
            name="phone"
            type="tel"
            placeholder="09xxxxxxxxx"
            required
            className="input-zen"
          />
          <button
            type="button"
            onClick={(event) => handleSendOtp(event.currentTarget.form)}
            className="shrink-0 rounded-2xl border border-[#F5C56B] px-4 py-2 text-xs font-bold text-[#D97706] transition hover:bg-[#FFF8E8] hover:text-[#171B23] disabled:opacity-60"
            disabled={isOtpPending}
          >
            {isOtpPending ? "در حال ارسال" : "ارسال کد"}
          </button>
        </div>
      </div>
      <div className="space-y-2">
        <label htmlFor="otpCode" className="text-xs font-bold text-[#475467]">
          کد تایید پیامکی
        </label>
        <input
          id="otpCode"
          name="otpCode"
          inputMode="numeric"
          required
          className="input-zen"
        />
      </div>
      {otpMessage && <p className="rounded-xl bg-green-50 px-3 py-2 text-xs font-bold text-emerald-600">{otpMessage}</p>}
      {otpError && <p className="rounded-xl bg-red-50 px-3 py-2 text-xs font-bold text-red-500">{otpError}</p>}
      {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-xs font-bold text-red-500">{error}</p>}
      <button
        type="submit"
        className="btn-primary w-full"
        disabled={isPending}
      >
        {isPending ? "در حال ورود..." : "ورود"}
      </button>
      <p className="text-center text-xs text-[#667085]">کد تایید به شماره وارد شده ارسال می‌شود.</p>
    </form>
  );
}
