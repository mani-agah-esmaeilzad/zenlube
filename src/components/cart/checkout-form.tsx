"use client";

import { useActionState, useEffect, useMemo, useState, useTransition } from "react";
import type { InputHTMLAttributes } from "react";

import { createCheckoutOrderAction, CheckoutState } from "@/actions/orders";
import { formatPrice } from "@/lib/utils";

const initialState: CheckoutState = { success: false };

const shippingOptions = [
  { value: "STANDARD", label: "ارسال استاندارد (۳ تا ۵ روز)", cost: 60000 },
  { value: "EXPRESS", label: "ارسال سریع (۱ تا ۲ روز)", cost: 120000 },
  { value: "PICKUP", label: "تحویل حضوری از انبار تهران", cost: 0 },
] as const;

type CheckoutItem = {
  id: string;
  name: string;
  quantity: number;
  price: number;
};

type CheckoutDefaults = {
  fullName?: string | null;
  email?: string | null;
  phone?: string | null;
  address1?: string | null;
  address2?: string | null;
  city?: string | null;
  province?: string | null;
  postalCode?: string | null;
};

type CheckoutFormProps = {
  items: CheckoutItem[];
  defaults: CheckoutDefaults;
};

export function CheckoutForm({ items, defaults }: CheckoutFormProps) {
  const [state, formAction] = useActionState(createCheckoutOrderAction, initialState);
  const [shipping, setShipping] = useState<(typeof shippingOptions)[number]["value"]>("STANDARD");
  const [otpMessage, setOtpMessage] = useState<string | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isOtpPending, startOtpTransition] = useTransition();

  const subtotal = useMemo(
    () => items.reduce((total, item) => total + item.price * item.quantity, 0),
    [items],
  );

  const shippingCost = useMemo(() => {
    const option = shippingOptions.find((opt) => opt.value === shipping);
    return option ? option.cost : 0;
  }, [shipping]);

  const total = subtotal + shippingCost;

  useEffect(() => {
    if (state.success && state.redirectUrl) {
      window.location.href = state.redirectUrl;
    }
  }, [state.success, state.redirectUrl]);

  useEffect(() => {
    if (!state.success && state.message) {
      setOtpMessage(null);
      setOtpError(state.message);
    }
  }, [state.success, state.message]);

  const handleSendOtp = (form: HTMLFormElement) => {
    const phone = (new FormData(form).get("phone") ?? "").toString();
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
          body: JSON.stringify({ phone, purpose: "checkout" }),
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
    <form action={formAction} className="grid gap-8 lg:grid-cols-[2fr_1fr]">
      <div className="space-y-8">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-700 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">اطلاعات تماس و ارسال</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <FieldInput
              label="نام و نام خانوادگی"
              name="fullName"
              defaultValue={defaults.fullName ?? ""}
              errors={state.errors?.fullName}
              required
            />
            <FieldInput
              label="ایمیل"
              name="email"
              type="email"
              defaultValue={defaults.email ?? ""}
              errors={state.errors?.email}
              required
            />
            <label className="text-xs font-semibold text-slate-500">
              شماره موبایل
              <div className="mt-2 flex gap-2">
                <input
                  name="phone"
                  type="tel"
                  defaultValue={defaults.phone ?? ""}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 placeholder-slate-400 focus:border-sky-300 focus:outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={(event) => handleSendOtp(event.currentTarget.form!)}
                  className="shrink-0 rounded-2xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-sky-300 disabled:opacity-60"
                  disabled={isOtpPending}
                >
                  {isOtpPending ? "در حال ارسال" : "ارسال کد"}
                </button>
              </div>
              {state.errors?.phone?.map((error) => (
                <span key={error} className="mt-1 block text-[11px] text-red-500">
                  {error}
                </span>
              ))}
            </label>
            <FieldInput
              label="کد تایید پیامکی"
              name="otpCode"
              inputMode="numeric"
              defaultValue=""
              errors={state.errors?.otpCode}
              required
            />
          </div>
          {otpMessage && <p className="mt-3 text-xs text-emerald-600">{otpMessage}</p>}
          {otpError && <p className="mt-3 text-xs text-red-500">{otpError}</p>}
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-700 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">آدرس تحویل</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <FieldInput
              label="آدرس اصلی"
              name="address1"
              defaultValue={defaults.address1 ?? ""}
              errors={state.errors?.address1}
              required
            />
            <FieldInput
              label="آدرس تکمیلی"
              name="address2"
              defaultValue={defaults.address2 ?? ""}
            />
            <FieldInput
              label="شهر"
              name="city"
              defaultValue={defaults.city ?? ""}
              errors={state.errors?.city}
              required
            />
            <FieldInput
              label="استان"
              name="province"
              defaultValue={defaults.province ?? ""}
              errors={state.errors?.province}
              required
            />
            <FieldInput
              label="کد پستی"
              name="postalCode"
              defaultValue={defaults.postalCode ?? ""}
              errors={state.errors?.postalCode}
              required
            />
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <input type="checkbox" name="saveAddress" defaultChecked className="size-4 rounded border border-slate-300 text-sky-500 focus:ring-sky-300" />
              ذخیره به عنوان آدرس پیش‌فرض
            </label>
          </div>
          <label className="mt-6 block text-xs font-semibold text-slate-500">
            توضیحات سفارش
            <textarea
              name="notes"
              rows={3}
              defaultValue=""
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 placeholder-slate-400 focus:border-sky-300 focus:outline-none"
            />
          </label>
        </section>
      </div>

      <aside className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-700 shadow-lg shadow-slate-500/10">
        <h2 className="text-lg font-semibold text-slate-900">خلاصه سفارش</h2>
        <div className="mt-4 space-y-3 text-sm">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between text-slate-600">
              <span>
                {item.name}
                <span className="mr-1 text-slate-400">×{item.quantity}</span>
              </span>
              <span>{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}
          <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex justify-between text-slate-500">
              <span>جمع جزء</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>روش ارسال</span>
              <select
                name="shippingMethod"
                value={shipping}
                onChange={(event) => setShipping(event.target.value as typeof shipping)}
                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600 focus:border-sky-300 focus:outline-none"
              >
                {shippingOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label} - {formatPrice(option.cost)}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>هزینه ارسال</span>
              <span>{formatPrice(shippingCost)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-base font-semibold text-slate-900">
              <span>مبلغ قابل پرداخت</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
        </div>

        {!state.success && state.message && (
          <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-600">{state.message}</p>
        )}

        <button
          type="submit"
          className="mt-6 w-full rounded-full bg-sky-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-600 disabled:opacity-60"
          disabled={state.success}
        >
          اتصال به درگاه زرین‌پال
        </button>
        <p className="mt-3 text-xs text-slate-500">با تکمیل فرم و ادامه فرایند خرید، اطلاعات شما با رمزگذاری امن منتقل می‌شود.</p>
      </aside>
    </form>
  );
}

type FieldInputProps = {
  label: string;
  name: string;
  type?: string;
  inputMode?: InputHTMLAttributes<HTMLInputElement>["inputMode"];
  defaultValue?: string;
  errors?: string[];
  required?: boolean;
};

function FieldInput({ label, name, type = "text", inputMode, defaultValue, errors, required }: FieldInputProps) {
  return (
    <label className="text-xs font-semibold text-slate-500">
      {label}
      <input
        name={name}
        type={type}
        inputMode={inputMode}
        defaultValue={defaultValue ?? ""}
        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 placeholder-slate-400 focus:border-sky-300 focus:outline-none"
        required={required}
      />
      {errors?.map((error) => (
        <span key={error} className="mt-1 block text-[11px] text-red-500">
          {error}
        </span>
      ))}
    </label>
  );
}
