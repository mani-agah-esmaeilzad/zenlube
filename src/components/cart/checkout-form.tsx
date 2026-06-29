"use client";

import type { InputHTMLAttributes } from "react";
import { useActionState, useEffect, useMemo, useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { createCheckoutOrderAction, CheckoutState } from "@/actions/orders";
import { formatPrice } from "@/lib/utils";

const initialState: CheckoutState = { success: false };

const shippingOptions = [
  { value: "STANDARD", label: "ارسال استاندارد", detail: "۳ تا ۵ روز کاری", cost: 60000 },
  { value: "EXPRESS", label: "ارسال سریع", detail: "۱ تا ۲ روز کاری", cost: 120000 },
  { value: "PICKUP", label: "تحویل حضوری", detail: "هماهنگی با پشتیبانی", cost: 0 },
] as const;

type CheckoutItem = { id: string; name: string; quantity: number; price: number };
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
type CheckoutFormProps = { items: CheckoutItem[]; defaults: CheckoutDefaults };

export function CheckoutForm({ items, defaults }: CheckoutFormProps) {
  const [state, formAction] = useActionState(createCheckoutOrderAction, initialState);
  const [shipping, setShipping] = useState<(typeof shippingOptions)[number]["value"]>("STANDARD");
  const [otpMessage, setOtpMessage] = useState<string | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isOtpPending, startOtpTransition] = useTransition();

  const subtotal = useMemo(() => items.reduce((total, item) => total + item.price * item.quantity, 0), [items]);
  const shippingCost = useMemo(() => shippingOptions.find((option) => option.value === shipping)?.cost ?? 0, [shipping]);
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
        setOtpMessage("کد تایید ارسال شد. لطفا ظرف ۵ دقیقه آن را وارد کنید.");
      } catch (error) {
        setOtpError(error instanceof Error ? error.message : "ارسال کد با خطا مواجه شد.");
      }
    });
  };

  return (
    <form action={formAction} className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <div className="space-y-6">
        <Stepper />

        <section className="rounded-[28px] border border-[#E7E8EE] bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.07)] md:p-6">
          <SectionTitle title="اطلاعات تماس" subtitle="کد تایید برای همین شماره ارسال می‌شود." />
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Field label="نام و نام خانوادگی" name="fullName" defaultValue={defaults.fullName ?? ""} errors={state.errors?.fullName} required />
            <Field label="ایمیل" name="email" type="email" defaultValue={defaults.email ?? ""} errors={state.errors?.email} required />
            <label className="text-xs font-bold text-[#374151]">
              شماره موبایل
              <div className="mt-2 flex gap-2">
                <input name="phone" type="tel" defaultValue={defaults.phone ?? ""} className="input-zen" required />
                <button type="button" onClick={(event) => handleSendOtp(event.currentTarget.form!)} className="btn-outline shrink-0 !min-h-11 border-[#F5C56B] text-xs text-[#D97706]" disabled={isOtpPending}>
                  {isOtpPending ? "در حال ارسال" : "ارسال کد"}
                </button>
              </div>
              {state.errors?.phone?.map((error) => <ErrorText key={error} error={error} />)}
            </label>
            <Field label="کد تایید پیامکی" name="otpCode" inputMode="numeric" errors={state.errors?.otpCode} required />
          </div>
          {otpMessage && <p className="mt-3 rounded-xl bg-green-50 px-3 py-2 text-xs font-bold text-[#16A34A]">{otpMessage}</p>}
          {otpError && <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-xs font-bold text-[#DC2626]">{otpError}</p>}
        </section>

        <section className="rounded-[28px] border border-[#E7E8EE] bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.07)] md:p-6">
          <SectionTitle title="آدرس و ارسال" subtitle="آدرس دقیق باعث پردازش سریع‌تر سفارش می‌شود." />
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Field label="آدرس اصلی" name="address1" defaultValue={defaults.address1 ?? ""} errors={state.errors?.address1} required />
            <Field label="آدرس تکمیلی" name="address2" defaultValue={defaults.address2 ?? ""} />
            <Field label="شهر" name="city" defaultValue={defaults.city ?? ""} errors={state.errors?.city} required />
            <Field label="استان" name="province" defaultValue={defaults.province ?? ""} errors={state.errors?.province} required />
            <Field label="کد پستی" name="postalCode" defaultValue={defaults.postalCode ?? ""} errors={state.errors?.postalCode} required />
            <label className="flex items-center gap-2 self-end rounded-2xl border border-[#E7E8EE] px-4 py-3 text-xs font-bold text-[#374151]">
              <input type="checkbox" name="saveAddress" defaultChecked className="size-4 accent-[#F59E0B]" />
              ذخیره به عنوان آدرس پیش‌فرض
            </label>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {shippingOptions.map((option) => (
              <label
                key={option.value}
                className={`cursor-pointer rounded-2xl border p-4 text-xs transition ${
                  shipping === option.value ? "border-[#F5C56B] bg-[#FFF8E8]" : "border-[#E7E8EE] bg-white hover:border-[#F5C56B]"
                }`}
              >
                <input
                  type="radio"
                  name="shippingMethod"
                  value={option.value}
                  checked={shipping === option.value}
                  onChange={() => setShipping(option.value)}
                  className="sr-only"
                />
                <span className="block font-black text-[#111827]">{option.label}</span>
                <span className="mt-1 block text-[#6B7280]">{option.detail}</span>
                <span className="mt-3 block font-bold text-[#D97706]">{formatPrice(option.cost)}</span>
              </label>
            ))}
          </div>

          <label className="mt-5 block text-xs font-bold text-[#374151]">
            توضیحات سفارش
            <textarea name="notes" rows={3} defaultValue="" className="input-zen mt-2 resize-none" />
          </label>
        </section>
      </div>

      <aside className="space-y-4">
        <section className="rounded-[28px] border border-[#E7E8EE] bg-white p-5 text-sm shadow-[0_16px_40px_rgba(15,23,42,0.07)] lg:sticky lg:top-40">
          <h2 className="text-lg font-extrabold text-[#111827]">خلاصه سفارش</h2>
          <div className="mt-4 space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex items-start justify-between gap-3 text-xs text-[#6B7280]">
                <span className="line-clamp-2">
                  {item.name}
                  <span className="mr-1 text-[#9CA3AF]">×{item.quantity.toLocaleString("fa-IR")}</span>
                </span>
                <span className="shrink-0 font-bold text-[#374151]">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
            <SummaryRow label="جمع کالاها" value={formatPrice(subtotal)} />
            <SummaryRow label="هزینه ارسال" value={formatPrice(shippingCost)} />
            <div className="flex justify-between border-t border-[#E5E7EB] pt-3 text-base font-extrabold text-[#111827]">
              <span>مبلغ قابل پرداخت</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
          {!state.success && state.message && <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-[#DC2626]">{state.message}</p>}
          {state.success && state.message && <p className="mt-4 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-700">{state.message}</p>}
          <SubmitButton />
          <p className="mt-3 text-xs leading-6 text-[#6B7280]">پرداخت از طریق درگاه امن زرین‌پال انجام می‌شود. بعد از پرداخت، وضعیت سفارش در حساب کاربری شما ثبت می‌شود.</p>
        </section>
      </aside>
    </form>
  );
}

function Stepper() {
  const steps = ["سبد خرید", "آدرس و ارسال", "پرداخت", "تکمیل سفارش"];
  return (
    <div className="grid grid-cols-4 gap-2 rounded-[24px] border border-[#E7E8EE] bg-white p-3 text-center text-[11px] font-bold text-[#6B7280]">
      {steps.map((step, index) => (
        <div key={step} className={`rounded-2xl px-2 py-3 ${index === 1 || index === 2 ? "bg-[#FFF8E8] text-[#D97706]" : "bg-[#F7F7F8]"}`}>
          {step}
        </div>
      ))}
    </div>
  );
}

function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <h2 className="text-lg font-extrabold text-[#111827]">{title}</h2>
      <p className="mt-1 text-xs leading-6 text-[#6B7280]">{subtitle}</p>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-t border-[#E5E7EB] pt-3 text-[#6B7280]">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary mt-5 w-full" disabled={pending}>
      {pending ? "در حال انتقال به درگاه پرداخت..." : "پرداخت و ثبت نهایی سفارش"}
    </button>
  );
}

function Field({
  label,
  name,
  type = "text",
  inputMode,
  defaultValue = "",
  errors,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  inputMode?: InputHTMLAttributes<HTMLInputElement>["inputMode"];
  defaultValue?: string;
  errors?: string[];
  required?: boolean;
}) {
  return (
    <label className="text-xs font-bold text-[#374151]">
      {label}
      <input name={name} type={type} inputMode={inputMode} defaultValue={defaultValue} className="input-zen mt-2" required={required} />
      {errors?.map((error) => <ErrorText key={error} error={error} />)}
    </label>
  );
}

function ErrorText({ error }: { error: string }) {
  return <span className="mt-1 block text-[11px] font-bold text-[#DC2626]">{error}</span>;
}
