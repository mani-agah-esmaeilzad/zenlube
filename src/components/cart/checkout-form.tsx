"use client";

import { useActionState, useEffect, useMemo, useState, useTransition } from "react";

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
        <section className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-900 shadow-sm">
          <h2 className="text-lg font-semibold">اطلاعات تماس و ارسال</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="text-xs text-slate-600">
              نام و نام خانوادگی
              <input
                name="fullName"
                defaultValue={defaults.fullName ?? ""}
                className="mt-2 w-full rounded-2xl border border-white/20 bg-white px-4 py-3 text-sm text-slate-900 placeholder-white/40 focus:border-orange-400 focus:outline-none"
                required
              />
              {state.errors?.fullName?.map((error) => (
                <span key={error} className="mt-1 block text-[11px] text-red-600">
                  {error}
                </span>
              ))}
            </label>
            <label className="text-xs text-slate-600">
              ایمیل
              <input
                type="email"
                name="email"
                defaultValue={defaults.email ?? ""}
                className="mt-2 w-full rounded-2xl border border-white/20 bg-white px-4 py-3 text-sm text-slate-900 placeholder-white/40 focus:border-orange-400 focus:outline-none"
                required
              />
              {state.errors?.email?.map((error) => (
                <span key={error} className="mt-1 block text-[11px] text-red-600">
                  {error}
                </span>
              ))}
            </label>
            <label className="text-xs text-slate-600">
              شماره موبایل
              <div className="mt-2 flex gap-2">
                <input
                  name="phone"
                  type="tel"
                  defaultValue={defaults.phone ?? ""}
                  className="w-full rounded-2xl border border-white/20 bg-white px-4 py-3 text-sm text-slate-900 placeholder-white/40 focus:border-orange-400 focus:outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={(event) => handleSendOtp(event.currentTarget.form!)}
                  className="shrink-0 rounded-2xl border border-orange-300 px-4 py-2 text-xs font-semibold text-orange-600 transition hover:border-orange-400 hover:text-slate-900 disabled:opacity-60"
                  disabled={isOtpPending}
                >
                  {isOtpPending ? "در حال ارسال" : "ارسال کد"}
                </button>
              </div>
              {state.errors?.phone?.map((error) => (
                <span key={error} className="mt-1 block text-[11px] text-red-600">
                  {error}
                </span>
              ))}
            </label>
            <label className="text-xs text-slate-600">
              کد تایید پیامکی
              <input
                name="otpCode"
                inputMode="numeric"
                className="mt-2 w-full rounded-2xl border border-white/20 bg-white px-4 py-3 text-sm text-slate-900 placeholder-white/40 focus:border-orange-400 focus:outline-none"
                required
              />
              {state.errors?.otpCode?.map((error) => (
                <span key={error} className="mt-1 block text-[11px] text-red-600">
                  {error}
                </span>
              ))}
            </label>
          </div>

          {otpMessage && <p className="mt-3 text-xs text-emerald-600">{otpMessage}</p>}
          {otpError && <p className="mt-3 text-xs text-red-600">{otpError}</p>}
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-900 shadow-sm">
          <h2 className="text-lg font-semibold">آدرس تحویل</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="text-xs text-slate-600">
              آدرس اصلی
              <input
                name="address1"
                defaultValue={defaults.address1 ?? ""}
                className="mt-2 w-full rounded-2xl border border-white/20 bg-white px-4 py-3 text-sm text-slate-900 placeholder-white/40 focus:border-orange-400 focus:outline-none"
                required
              />
              {state.errors?.address1?.map((error) => (
                <span key={error} className="mt-1 block text-[11px] text-red-600">
                  {error}
                </span>
              ))}
            </label>
            <label className="text-xs text-slate-600">
              آدرس تکمیلی
              <input
                name="address2"
                defaultValue={defaults.address2 ?? ""}
                className="mt-2 w-full rounded-2xl border border-white/20 bg-white px-4 py-3 text-sm text-slate-900 placeholder-white/40 focus:border-orange-400 focus:outline-none"
              />
            </label>
            <label className="text-xs text-slate-600">
              شهر
              <input
                name="city"
                defaultValue={defaults.city ?? ""}
                className="mt-2 w-full rounded-2xl border border-white/20 bg-white px-4 py-3 text-sm text-slate-900 placeholder-white/40 focus:border-orange-400 focus:outline-none"
                required
              />
              {state.errors?.city?.map((error) => (
                <span key={error} className="mt-1 block text-[11px] text-red-600">
                  {error}
                </span>
              ))}
            </label>
            <label className="text-xs text-slate-600">
              استان
              <input
                name="province"
                defaultValue={defaults.province ?? ""}
                className="mt-2 w-full rounded-2xl border border-white/20 bg-white px-4 py-3 text-sm text-slate-900 placeholder-white/40 focus:border-orange-400 focus:outline-none"
                required
              />
              {state.errors?.province?.map((error) => (
                <span key={error} className="mt-1 block text-[11px] text-red-600">
                  {error}
                </span>
              ))}
            </label>
            <label className="text-xs text-slate-600">
              کد پستی
              <input
                name="postalCode"
                defaultValue={defaults.postalCode ?? ""}
                className="mt-2 w-full rounded-2xl border border-white/20 bg-white px-4 py-3 text-sm text-slate-900 placeholder-white/40 focus:border-orange-400 focus:outline-none"
                required
              />
              {state.errors?.postalCode?.map((error) => (
                <span key={error} className="mt-1 block text-[11px] text-red-600">
                  {error}
                </span>
              ))}
            </label>
            <label className="flex items-center gap-2 text-xs text-slate-600">
              <input type="checkbox" name="saveAddress" defaultChecked className="size-4 rounded border border-white/40 bg-white" />
              ذخیره به عنوان آدرس پیش‌فرض
            </label>
          </div>

          <label className="mt-6 block text-xs text-slate-600">
            توضیحات سفارش
            <textarea
              name="notes"
              rows={3}
              defaultValue=""
              className="mt-2 w-full rounded-2xl border border-white/20 bg-white px-4 py-3 text-sm text-slate-900 placeholder-white/40 focus:border-orange-400 focus:outline-none"
            />
          </label>
        </section>
      </div>

      <aside className="space-y-6">
        <section className="rounded-3xl border border-slate-200 bg-white shadow-sm p-6 text-sm text-slate-700">
          <h2 className="text-lg font-semibold text-[#0f2747]">خلاصه سفارش</h2>
          <div className="mt-4 space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-xs">
                <span>
                  {item.name}
                  <span className="mr-1 text-slate-400">×{item.quantity}</span>
                </span>
                <span>{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>جمع جزء</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <label className="mt-4 block text-xs text-slate-600">
              روش ارسال
              <select
                name="shippingMethod"
                value={shipping}
                onChange={(event) => setShipping(event.target.value as typeof shipping)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-purple-200 focus:outline-none"
              >
                {shippingOptions.map((option) => (
                  <option key={option.value} value={option.value} className="bg-white text-slate-900">
                    {option.label} - {formatPrice(option.cost)}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>هزینه ارسال</span>
              <span>{formatPrice(shippingCost)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-white/10 pt-3 text-sm font-semibold text-[#0f2747]">
              <span>مبلغ قابل پرداخت</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
        </section>

        {!state.success && state.message && (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">{state.message}</p>
        )}

        <button
          type="submit"
          className="w-full rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-orange-600 disabled:opacity-60"
          disabled={state.success}
        >
          اتصال به درگاه زرین‌پال
        </button>
      </aside>
    </form>
  );
}
