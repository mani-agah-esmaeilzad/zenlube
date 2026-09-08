"use client";

import type { ChangeEvent, InputHTMLAttributes } from "react";
import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { useFormStatus } from "react-dom";

import { createCheckoutOrderAction, type CheckoutState } from "@/actions/orders";
import { LocationSelectors } from "@/components/shipping/location-selectors";
import type { ShippingRolloutMode } from "@/lib/shipping/rollout";
import { formatPrice } from "@/lib/utils";

const initialState: CheckoutState = { success: false };

type CheckoutItem = { id: string; name: string; quantity: number; price: number };
type CheckoutDefaults = {
  fullName?: string | null;
  email?: string | null;
  phone?: string | null;
  address1?: string | null;
  address2?: string | null;
  city?: string | null;
  province?: string | null;
  cityCode?: string | null;
  provinceCode?: string | null;
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
  cityCode: string | null;
  provinceCode: string | null;
  postalCode: string;
  isDefault: boolean;
};
type ShippingOption = {
  id: string;
  carrierCode: string;
  carrierLabel: string;
  serviceCode: string;
  serviceLabel: string;
  customerPriceRials: number;
  currency: "IRR";
  isFree: boolean;
  estimatedDeliveryLabel: string | null;
};
type ShippingQuote = {
  quoteId: string;
  mode: ShippingRolloutMode;
  expiresAt: string;
  subtotalRials: number;
  discountRials: number;
  options: ShippingOption[];
  unavailableCarriers: string[];
};
type CheckoutFormProps = {
  items: CheckoutItem[];
  defaults: CheckoutDefaults;
  addresses: SavedAddress[];
  checkoutIdempotencyKey: string;
  shippingMode: ShippingRolloutMode;
};

function normalizedDigitCount(value: string) {
  return value.replace(/[۰-۹٠-٩]/g, "0").replace(/\D/g, "").length;
}

export function CheckoutForm({ items, defaults, addresses, checkoutIdempotencyKey, shippingMode }: CheckoutFormProps) {
  const [state, formAction] = useActionState(createCheckoutOrderAction, initialState);
  const [selectedAddressId, setSelectedAddressId] = useState<string>(addresses.find((address) => address.isDefault)?.id ?? "");
  const [formValues, setFormValues] = useState({
    fullName: defaults.fullName ?? "",
    email: defaults.email ?? "",
    phone: defaults.phone ?? "",
    address1: defaults.address1 ?? "",
    address2: defaults.address2 ?? "",
    cityCode: shippingMode === "dynamic" ? defaults.cityCode ?? "" : defaults.city ?? "",
    provinceCode: shippingMode === "dynamic" ? defaults.provinceCode ?? "" : defaults.province ?? "",
    postalCode: defaults.postalCode ?? "",
    couponCode: "",
  });
  const [quote, setQuote] = useState<ShippingQuote | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState("");
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [retryToken, setRetryToken] = useState(0);
  const [quoteExpired, setQuoteExpired] = useState(false);
  const requestSequence = useRef(0);

  const subtotal = useMemo(() => items.reduce((total, item) => total + item.price * item.quantity, 0), [items]);
  const selectedOption = quote?.options.find((option) => option.id === selectedOptionId) ?? null;
  const shippingCost = selectedOption?.customerPriceRials ?? 0;
  const discount = quote?.discountRials ?? 0;
  const total = Math.max(0, subtotal - discount + shippingCost);
  const destinationReady = Boolean(
    formValues.provinceCode
      && formValues.cityCode
      && formValues.address1.trim().length >= 5
      && normalizedDigitCount(formValues.postalCode) === 10,
  );

  useEffect(() => {
    if (state.success && state.redirectUrl) window.location.href = state.redirectUrl;
  }, [state.success, state.redirectUrl]);

  useEffect(() => {
    if (!quote) {
      setQuoteExpired(false);
      return;
    }
    const expiresAt = new Date(quote.expiresAt).getTime();
    const markExpired = () => setQuoteExpired(Date.now() >= expiresAt);
    markExpired();
    const delay = Math.max(0, expiresAt - Date.now());
    const timeout = window.setTimeout(markExpired, Math.min(delay + 50, 2_147_000_000));
    return () => window.clearTimeout(timeout);
  }, [quote]);

  useEffect(() => {
    const sequence = ++requestSequence.current;
    setSelectedOptionId("");
    setQuote(null);
    setQuoteError(null);

    if (!destinationReady) {
      setQuoteLoading(false);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setQuoteLoading(true);
      try {
        const response = await fetch("/api/shipping/quote", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            provinceCode: formValues.provinceCode,
            cityCode: formValues.cityCode,
            postalCode: formValues.postalCode,
            address1: formValues.address1,
            address2: formValues.address2 || undefined,
            couponCode: formValues.couponCode || undefined,
          }),
        });
        const payload = await response.json() as { success?: boolean; data?: ShippingQuote; message?: string };
        if (!response.ok || payload.success !== true || !payload.data) {
          throw new Error(payload.message || "در حال حاضر امکان محاسبه هزینه ارسال وجود ندارد.");
        }
        if (sequence !== requestSequence.current) return;
        if (payload.data.mode !== shippingMode) {
          window.location.reload();
          return;
        }
        setQuote(payload.data);
        if (payload.data.mode === "legacy") {
          setSelectedOptionId(payload.data.options.find((option) => option.serviceCode === "STANDARD")?.id ?? "");
        }
        if (payload.data.options.length === 0) {
          setQuoteError("متأسفانه در حال حاضر روش ارسالی برای این آدرس در دسترس نیست.");
        }
      } catch (error) {
        if (controller.signal.aborted || sequence !== requestSequence.current) return;
        setQuoteError(error instanceof Error ? error.message : "در حال حاضر امکان محاسبه هزینه ارسال وجود ندارد. لطفاً دوباره تلاش کنید.");
      } finally {
        if (sequence === requestSequence.current) setQuoteLoading(false);
      }
    }, 650);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [destinationReady, formValues.address1, formValues.address2, formValues.cityCode, formValues.couponCode, formValues.postalCode, formValues.provinceCode, retryToken, shippingMode]);

  const handleAddressSelect = (addressId: string) => {
    setSelectedAddressId(addressId);
    const selectedAddress = addresses.find((address) => address.id === addressId);
    if (!selectedAddress) return;
    setFormValues((current) => ({
      ...current,
      fullName: selectedAddress.fullName,
      phone: selectedAddress.phone,
      address1: selectedAddress.address1,
      address2: selectedAddress.address2 ?? "",
      cityCode: shippingMode === "dynamic" ? selectedAddress.cityCode ?? "" : selectedAddress.city,
      provinceCode: shippingMode === "dynamic" ? selectedAddress.provinceCode ?? "" : selectedAddress.province,
      postalCode: selectedAddress.postalCode,
    }));
  };

  const handleFieldChange = (field: keyof typeof formValues, value: string) => {
    setSelectedAddressId("");
    setFormValues((current) => ({ ...current, [field]: value }));
  };

  const paymentDisabled = !destinationReady || !selectedOption || quoteExpired || quoteLoading;

  return (
    <form action={formAction} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
      <input type="hidden" name="shippingOptionId" value={selectedOptionId} />
      <input type="hidden" name="checkoutIdempotencyKey" value={checkoutIdempotencyKey} />
      <div>
        <Stepper />

        <section className="border-b border-border py-6">
          <SectionTitle title="اطلاعات تماس" subtitle="این شماره فقط برای هماهنگی تحویل سفارش استفاده می‌شود." />
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Field autoComplete="name" label="نام و نام خانوادگی" name="fullName" value={formValues.fullName} onChange={(value) => handleFieldChange("fullName", value)} errors={state.errors?.fullName} required />
            <Field autoComplete="email" label="ایمیل" name="email" type="email" value={formValues.email} onChange={(value) => handleFieldChange("email", value)} errors={state.errors?.email} required />
            <Field autoComplete="tel" inputMode="tel" label="شماره موبایل تحویل‌گیرنده" name="phone" type="tel" value={formValues.phone} onChange={(value) => handleFieldChange("phone", value)} errors={state.errors?.phone} required />
          </div>
        </section>

        <section className="border-b border-border py-6">
          <SectionTitle
            title="آدرس تحویل سفارش"
            subtitle={shippingMode === "dynamic"
              ? "استان و شهر را انتخاب کنید تا هزینه واقعی ارسال محاسبه شود."
              : "آدرس دقیق باعث پردازش سریع‌تر سفارش می‌شود."}
          />
          {addresses.length ? (
            <div className="mt-5 divide-y divide-border border-t border-border">
              {addresses.map((address) => (
                <button key={address.id} type="button" onClick={() => handleAddressSelect(address.id)} className={`relative block min-h-11 w-full border-r-2 px-3 py-3 text-right text-xs transition hover:bg-surface-secondary ${selectedAddressId === address.id ? "border-primary-accent-strong bg-surface-tint" : "border-transparent bg-white"}`}>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-text-strong">{address.label}</span>
                    {address.isDefault ? <span className="text-[10px] font-bold text-primary-accent-strong">پیش‌فرض</span> : null}
                    {selectedAddressId === address.id ? <span className="mr-auto text-[10px] font-bold text-primary-accent-strong">انتخاب‌شده</span> : null}
                  </div>
                  <p className="mt-2 leading-6 text-[#374151]">{address.fullName} · {address.phone}</p>
                  <p className="leading-6 text-text-muted">{address.province}، {address.city}، {address.address1}</p>
                  {shippingMode === "dynamic" && (!address.cityCode || !address.provinceCode) ? <p className="mt-1 text-[10px] font-bold text-[#B45309]">برای محاسبه ارسال، استان و شهر این آدرس را دوباره انتخاب کنید.</p> : null}
                </button>
              ))}
            </div>
          ) : null}
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {shippingMode === "dynamic" ? (
              <LocationSelectors
                provinceCode={formValues.provinceCode}
                cityCode={formValues.cityCode}
                defaultProvinceName={defaults.province}
                defaultCityName={defaults.city}
                onProvinceChange={(value) => handleFieldChange("provinceCode", value)}
                onCityChange={(value) => handleFieldChange("cityCode", value)}
                provinceErrors={state.errors?.provinceCode}
                cityErrors={state.errors?.cityCode}
              />
            ) : (
              <>
                <Field autoComplete="address-level1" label="استان" name="provinceCode" value={formValues.provinceCode} onChange={(value) => handleFieldChange("provinceCode", value)} errors={state.errors?.provinceCode} required />
                <Field autoComplete="address-level2" label="شهر" name="cityCode" value={formValues.cityCode} onChange={(value) => handleFieldChange("cityCode", value)} errors={state.errors?.cityCode} required />
              </>
            )}
            <Field autoComplete="street-address" label="آدرس اصلی" name="address1" value={formValues.address1} onChange={(value) => handleFieldChange("address1", value)} errors={state.errors?.address1} required />
            <Field autoComplete="address-line2" label="آدرس تکمیلی" name="address2" value={formValues.address2} onChange={(value) => handleFieldChange("address2", value)} />
            <Field autoComplete="postal-code" inputMode="numeric" label="کد پستی ۱۰ رقمی" name="postalCode" value={formValues.postalCode} onChange={(value) => handleFieldChange("postalCode", value)} errors={state.errors?.postalCode} required />
            <label className="flex min-h-11 items-center gap-2 self-end text-xs font-bold text-text"><input type="checkbox" name="saveAddress" defaultChecked className="size-4 accent-[#F59E0B]" />ذخیره به عنوان آدرس پیش‌فرض</label>
          </div>

          <div className="mt-7 border-t border-border pt-5" aria-live="polite">
            <SectionTitle
              title="روش ارسال"
              subtitle={shippingMode === "dynamic"
                ? "نرخ‌ها مستقیماً از سرویس حمل دریافت می‌شوند؛ یک روش معتبر را انتخاب کنید."
                : "تا زمان راه‌اندازی نرخ زنده، روش‌ها و هزینه‌های قبلی فروشگاه برقرار هستند."}
            />
            {!destinationReady && !quoteLoading ? <p className="mt-4 text-xs leading-6 text-text-muted">برای مشاهده روش‌ها و هزینه ارسال، استان، شهر، آدرس و کد پستی را کامل کنید.</p> : null}
            {quoteLoading ? <ShippingSkeleton /> : null}
            {quoteError && !quoteLoading ? <div className="mt-4 border-r-2 border-red-400 px-3 py-2 text-xs leading-6 text-[#B42318]"><p>{quoteError}</p><button type="button" className="mt-1 min-h-11 font-black underline underline-offset-4" onClick={() => setRetryToken((current) => current + 1)}>تلاش مجدد</button></div> : null}
            {quote?.options.length && !quoteLoading ? (
              <div className="mt-4 divide-y divide-border border-y border-border">
                {quote.options.map((option) => (
                  <label key={option.id} className={`flex min-h-14 cursor-pointer items-start gap-3 border-r-2 px-3 py-4 text-xs transition ${selectedOptionId === option.id ? "border-primary-accent-strong bg-surface-tint" : "border-transparent bg-white hover:bg-surface-secondary"}`}>
                    <input type="radio" name="shipping-choice" value={option.id} checked={selectedOptionId === option.id} onChange={() => setSelectedOptionId(option.id)} className="mt-1 size-4 shrink-0 accent-[#F59E0B]" />
                    <span className="min-w-0 flex-1"><span className="block font-black text-text-strong">{option.serviceLabel || option.carrierLabel}</span>{option.estimatedDeliveryLabel ? <span className="mt-1 block text-text-muted">{option.estimatedDeliveryLabel}</span> : null}</span>
                    <span className={`shrink-0 font-black ${option.isFree ? "text-[#16803C]" : "text-primary-accent-strong"}`}>{option.isFree ? "ارسال رایگان" : formatPrice(option.customerPriceRials)}</span>
                  </label>
                ))}
              </div>
            ) : null}
            {quoteExpired ? <div className="mt-4 border-r-2 border-amber-400 px-3 py-2 text-xs leading-6 text-[#92400E]">اعتبار قیمت ارسال تمام شده است.<button type="button" className="mr-2 min-h-11 font-black underline underline-offset-4" onClick={() => setRetryToken((current) => current + 1)}>محاسبه دوباره</button></div> : null}
          </div>

          <label className="mt-5 block text-xs font-bold text-text">کد تخفیف<input autoComplete="off" name="couponCode" value={formValues.couponCode} onChange={(event) => handleFieldChange("couponCode", event.target.value)} className="input-zen mt-2" placeholder="مثلاً OILBAR10" /></label>
          <label className="mt-5 block text-xs font-bold text-text">توضیحات سفارش<textarea name="notes" rows={3} defaultValue="" className="input-zen mt-2 resize-none" /></label>
        </section>
      </div>

      <aside>
        <section className="border-t border-border pt-5 text-sm lg:sticky lg:top-28 lg:border-t-0 lg:border-r lg:px-5 lg:py-0">
          <h2 className="text-lg font-extrabold text-text-strong">خلاصه سفارش</h2>
          <div className="mt-4 space-y-3">
            {items.map((item) => <div key={item.id} className="flex items-start justify-between gap-3 text-xs text-text-muted"><span className="line-clamp-2 min-w-0">{item.name}<span className="mr-1 text-text-soft">×{item.quantity.toLocaleString("fa-IR")}</span></span><span className="shrink-0 font-bold text-[#374151]">{formatPrice(item.price * item.quantity)}</span></div>)}
            <SummaryRow label="جمع کالاها" value={formatPrice(subtotal)} />
            {discount > 0 ? <SummaryRow label="تخفیف" value={`− ${formatPrice(discount)}`} /> : null}
            <SummaryRow label="هزینه ارسال" value={selectedOption ? (selectedOption.isFree ? "رایگان" : formatPrice(shippingCost)) : "پس از انتخاب روش"} />
            {selectedOption?.estimatedDeliveryLabel ? <SummaryRow label="تحویل تقریبی" value={selectedOption.estimatedDeliveryLabel} /> : null}
            <div className="flex justify-between border-t border-[rgba(245,158,11,0.16)] pt-3 text-base font-extrabold text-text-strong"><span>مبلغ قابل پرداخت</span><span>{formatPrice(total)}</span></div>
          </div>
          {!state.success && state.message && <p className="mt-4 border-r-2 border-red-400 px-3 py-2 text-xs leading-6 text-[#DC2626]">{state.message}</p>}
          {state.success && state.message && <p className="mt-4 border-r-2 border-blue-400 px-3 py-2 text-xs leading-6 text-blue-700">{state.message}</p>}
          <SubmitButton disabled={paymentDisabled} />
          {paymentDisabled ? <p className="mt-2 text-[11px] leading-5 text-text-muted">برای پرداخت، آدرس را کامل و یک روش ارسال معتبر انتخاب کنید.</p> : null}
          <p className="mt-3 text-xs leading-6 text-text-muted">{shippingMode === "dynamic" ? "مبلغ نهایی و نرخ واقعی ارسال پیش از اتصال به درگاه دوباره در سرور بررسی می‌شود." : "مبلغ نهایی و هزینه روش انتخاب‌شده پیش از اتصال به درگاه دوباره در سرور بررسی می‌شود."}</p>
        </section>
      </aside>
    </form>
  );
}

function ShippingSkeleton() {
  return <div className="mt-4 space-y-3" role="status"><p className="text-xs font-bold text-text-muted">در حال محاسبه هزینه ارسال...</p><div className="h-14 animate-pulse bg-surface-secondary" /><div className="h-14 animate-pulse bg-surface-secondary" /></div>;
}

function Stepper() {
  const steps = ["سبد خرید", "آدرس و ارسال", "پرداخت", "تکمیل سفارش"];
  return <ol className="grid grid-cols-4 border-b border-border text-[10px] font-bold text-text-muted sm:text-[11px]">{steps.map((step, index) => <li key={step} className={`-mb-px flex min-h-11 items-center justify-center gap-1 border-b-2 px-1 py-2 text-center ${index === 1 || index === 2 ? "border-primary-accent-strong text-primary-accent-strong" : "border-transparent"}`}><span className="hidden text-[10px] text-text-soft min-[390px]:inline">{(index + 1).toLocaleString("fa-IR")}.</span><span>{step}</span></li>)}</ol>;
}

function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return <div><h2 className="text-lg font-extrabold text-text-strong">{title}</h2><p className="mt-1 text-xs leading-6 text-text-muted">{subtitle}</p></div>;
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between gap-4 border-t border-[rgba(245,158,11,0.12)] pt-3 text-text-muted"><span>{label}</span><span className="text-left">{value}</span></div>;
}

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return <button type="submit" className="btn-primary mt-5 !min-h-11 w-full" disabled={pending || disabled}>{pending ? "در حال انتقال به درگاه پرداخت..." : "ادامه و پرداخت"}</button>;
}

type CheckoutFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> & { label: string; name: string; value?: string; onChange?: (value: string) => void; errors?: string[] };

function Field({ label, value, onChange, errors, ...inputProps }: CheckoutFieldProps) {
  const controlledProps = onChange ? { value: value ?? "", onChange: (event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value) } : {};
  return <label className="text-xs font-bold text-text">{label}<input {...inputProps} {...controlledProps} className="input-zen mt-2" />{errors?.map((error) => <ErrorText key={error} error={error} />)}</label>;
}

function ErrorText({ error }: { error: string }) {
  return <span className="mt-1 block text-[11px] font-bold text-[#DC2626]">{error}</span>;
}
