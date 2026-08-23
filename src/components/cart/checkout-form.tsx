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
type SavedAddress = {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  address1: string;
  address2: string | null;
  city: string;
  province: string;
  postalCode: string;
  isDefault: boolean;
};
type CheckoutFormProps = { items: CheckoutItem[]; defaults: CheckoutDefaults; addresses: SavedAddress[] };

export function CheckoutForm({ items, defaults, addresses }: CheckoutFormProps) {
  const [state, formAction] = useActionState(createCheckoutOrderAction, initialState);
  const [shipping, setShipping] = useState<(typeof shippingOptions)[number]["value"]>("STANDARD");
  const [otpMessage, setOtpMessage] = useState<string | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isOtpPending, startOtpTransition] = useTransition();
  const [selectedAddressId, setSelectedAddressId] = useState<string>(addresses.find((address) => address.isDefault)?.id ?? "");
  const [formValues, setFormValues] = useState({
    fullName: defaults.fullName ?? "",
    email: defaults.email ?? "",
    phone: defaults.phone ?? "",
    address1: defaults.address1 ?? "",
    address2: defaults.address2 ?? "",
    city: defaults.city ?? "",
    province: defaults.province ?? "",
    postalCode: defaults.postalCode ?? "",
  });

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

  const handleAddressSelect = (addressId: string) => {
    setSelectedAddressId(addressId);
    const selectedAddress = addresses.find((address) => address.id === addressId);
    if (!selectedAddress) {
      return;
    }

    setFormValues((current) => ({
      ...current,
      fullName: selectedAddress.fullName,
      phone: selectedAddress.phone,
      address1: selectedAddress.address1,
      address2: selectedAddress.address2 ?? "",
      city: selectedAddress.city,
      province: selectedAddress.province,
      postalCode: selectedAddress.postalCode,
    }));
  };

  const handleFieldChange = (field: keyof typeof formValues, value: string) => {
    setFormValues((current) => ({ ...current, [field]: value }));
  };

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
    <form action={formAction} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
      <div className="space-y-6">
        <Stepper />

        <section className="rounded-2xl border border-border bg-white p-5 md:p-6">
          <SectionTitle title="اطلاعات تماس" subtitle="کد تایید برای همین شماره ارسال می‌شود." />
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Field autoComplete="name" label="نام و نام خانوادگی" name="fullName" value={formValues.fullName} onChange={(value) => handleFieldChange("fullName", value)} errors={state.errors?.fullName} required />
            <Field autoComplete="email" label="ایمیل" name="email" type="email" value={formValues.email} onChange={(value) => handleFieldChange("email", value)} errors={state.errors?.email} required />
            <label className="text-xs font-bold text-text">
              شماره موبایل
              <div className="mt-2 flex flex-col gap-2 min-[360px]:flex-row">
                <input autoComplete="tel" inputMode="tel" name="phone" type="tel" value={formValues.phone} onChange={(event) => handleFieldChange("phone", event.target.value)} className="input-zen" required />
                <button type="button" onClick={(event) => handleSendOtp(event.currentTarget.form!)} className="btn-outline shrink-0 text-xs text-primary-accent-strong" disabled={isOtpPending}>
                  {isOtpPending ? "در حال ارسال" : "ارسال کد"}
                </button>
              </div>
              {state.errors?.phone?.map((error) => <ErrorText key={error} error={error} />)}
            </label>
            <Field autoComplete="one-time-code" label="کد تایید پیامکی" name="otpCode" inputMode="numeric" errors={state.errors?.otpCode} required />
          </div>
          {otpMessage && <p className="mt-3 rounded-xl bg-green-50 px-3 py-2 text-xs font-bold text-[#16A34A]">{otpMessage}</p>}
          {otpError && <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-xs font-bold text-[#DC2626]">{otpError}</p>}
        </section>

        <section className="rounded-2xl border border-border bg-white p-5 md:p-6">
          <SectionTitle title="آدرس و ارسال" subtitle="آدرس دقیق باعث پردازش سریع‌تر سفارش می‌شود." />
          {addresses.length ? (
            <div className="mt-5 grid gap-3 min-[360px]:grid-cols-2">
              {addresses.map((address) => (
                <button
                  key={address.id}
                  type="button"
                  onClick={() => handleAddressSelect(address.id)}
                  className={`rounded-xl border p-4 text-right text-xs transition ${selectedAddressId === address.id ? "border-[rgba(217,119,6,0.28)] bg-surface-tint" : "border-border bg-white"}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-black text-text-strong">{address.label}</span>
                    {address.isDefault ? <span className="chip-zen px-2 py-1 text-[10px]">پیش‌فرض</span> : null}
                  </div>
                  <p className="mt-2 leading-6 text-[#374151]">{address.fullName} · {address.phone}</p>
                  <p className="leading-6 text-text-muted">{address.province}، {address.city}، {address.address1}</p>
                </button>
              ))}
            </div>
          ) : null}
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Field autoComplete="street-address" label="آدرس اصلی" name="address1" value={formValues.address1} onChange={(value) => handleFieldChange("address1", value)} errors={state.errors?.address1} required />
            <Field autoComplete="address-line2" label="آدرس تکمیلی" name="address2" value={formValues.address2} onChange={(value) => handleFieldChange("address2", value)} />
            <Field autoComplete="address-level2" label="شهر" name="city" value={formValues.city} onChange={(value) => handleFieldChange("city", value)} errors={state.errors?.city} required />
            <Field autoComplete="address-level1" label="استان" name="province" value={formValues.province} onChange={(value) => handleFieldChange("province", value)} errors={state.errors?.province} required />
            <Field autoComplete="postal-code" inputMode="numeric" label="کد پستی" name="postalCode" value={formValues.postalCode} onChange={(value) => handleFieldChange("postalCode", value)} errors={state.errors?.postalCode} required />
            <label className="flex items-center gap-2 self-end rounded-xl border border-border bg-surface-secondary px-4 py-3 text-xs font-bold text-text">
              <input type="checkbox" name="saveAddress" defaultChecked className="size-4 accent-[#F59E0B]" />
              ذخیره به عنوان آدرس پیش‌فرض
            </label>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {shippingOptions.map((option) => (
              <label
                key={option.value}
                className={`cursor-pointer rounded-xl border p-4 text-xs transition ${
                  shipping === option.value ? "border-[rgba(217,119,6,0.26)] bg-surface-tint" : "border-border bg-white hover:border-[rgba(217,119,6,0.24)]"
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
                <span className="block font-black text-text-strong">{option.label}</span>
                <span className="mt-1 block text-text-muted">{option.detail}</span>
                <span className="mt-3 block font-bold text-primary-accent-strong">{formatPrice(option.cost)}</span>
              </label>
            ))}
          </div>

          <label className="mt-5 block text-xs font-bold text-text">
            کد تخفیف
            <input autoComplete="off" name="couponCode" className="input-zen mt-2" placeholder="مثلاً OILBAR10" />
          </label>

          <label className="mt-5 block text-xs font-bold text-text">
            توضیحات سفارش
            <textarea name="notes" rows={3} defaultValue="" className="input-zen mt-2 resize-none" />
          </label>
        </section>
      </div>

      <aside className="space-y-4">
        <section className="rounded-2xl border border-border bg-surface-secondary p-5 text-sm lg:sticky lg:top-28">
          <h2 className="text-lg font-extrabold text-text-strong">خلاصه سفارش</h2>
          <div className="mt-4 space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex items-start justify-between gap-3 text-xs text-text-muted">
                <span className="line-clamp-2 min-w-0">
                  {item.name}
                  <span className="mr-1 text-text-soft">×{item.quantity.toLocaleString("fa-IR")}</span>
                </span>
                <span className="shrink-0 font-bold text-[#374151]">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
            <SummaryRow label="جمع کالاها" value={formatPrice(subtotal)} />
            <SummaryRow label="هزینه ارسال" value={formatPrice(shippingCost)} />
            <SummaryRow
              label="تحویل تقریبی"
              value={
                shipping === "EXPRESS"
                  ? "۱ تا ۲ روز کاری"
                  : shipping === "PICKUP"
                    ? "تحویل حضوری"
                    : "۳ تا ۵ روز کاری"
              }
            />
            <div className="flex justify-between border-t border-[rgba(245,158,11,0.16)] pt-3 text-base font-extrabold text-text-strong">
              <span>مبلغ قابل پرداخت</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
          {!state.success && state.message && <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-[#DC2626]">{state.message}</p>}
          {state.success && state.message && <p className="mt-4 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-700">{state.message}</p>}
          <SubmitButton />
          <p className="mt-3 text-xs leading-6 text-text-muted">پرداخت از طریق درگاه امن زرین‌پال انجام می‌شود. بعد از پرداخت، وضعیت سفارش در حساب کاربری شما ثبت می‌شود.</p>
        </section>
      </aside>
    </form>
  );
}

function Stepper() {
  const steps = ["سبد خرید", "آدرس و ارسال", "پرداخت", "تکمیل سفارش"];
  return (
    <div className="grid grid-cols-2 gap-2 rounded-2xl border border-border bg-surface-secondary p-3 text-center text-[11px] font-bold text-text-muted sm:grid-cols-4">
      {steps.map((step, index) => (
        <div key={step} className={`rounded-xl px-2 py-3 ${index === 1 || index === 2 ? "bg-white text-primary-accent-strong" : "bg-white/70"}`}>
          {step}
        </div>
      ))}
    </div>
  );
}

function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <h2 className="text-lg font-extrabold text-text-strong">{title}</h2>
      <p className="mt-1 text-xs leading-6 text-text-muted">{subtitle}</p>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-t border-[rgba(245,158,11,0.12)] pt-3 text-text-muted">
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
  autoComplete,
  value = "",
  onChange,
  errors,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  inputMode?: InputHTMLAttributes<HTMLInputElement>["inputMode"];
  autoComplete?: InputHTMLAttributes<HTMLInputElement>["autoComplete"];
  value?: string;
  onChange?: (value: string) => void;
  errors?: string[];
  required?: boolean;
}) {
  return (
    <label className="text-xs font-bold text-text">
      {label}
      <input
        name={name}
        type={type}
        autoComplete={autoComplete}
        inputMode={inputMode}
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        className="input-zen mt-2"
        required={required}
      />
      {errors?.map((error) => <ErrorText key={error} error={error} />)}
    </label>
  );
}

function ErrorText({ error }: { error: string }) {
  return <span className="mt-1 block text-[11px] font-bold text-[#DC2626]">{error}</span>;
}
