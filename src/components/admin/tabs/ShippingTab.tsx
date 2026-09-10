"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";

import { saveShippingSettingsAction, syncShippingLocationsAction } from "@/actions/admin";
import type { ActionResult } from "@/actions/admin/types";
import type { ShippingTabData } from "@/services/admin/types";

const initialState: ActionResult = { success: false };

export function ShippingTab({ data }: { data: ShippingTabData }) {
  const [settingsState, settingsAction] = useActionState(saveShippingSettingsAction, initialState);
  const [syncState, syncAction] = useActionState(syncShippingLocationsAction, initialState);
  const [provinceCode, setProvinceCode] = useState(data.settings.originProvinceCode);
  const [cityCode, setCityCode] = useState(data.settings.originCityCode);
  const cities = data.cities.filter((city) => city.parentCode === provinceCode);
  const readyForActivation = data.rollout.setupReady;
  const dynamicActive = data.rollout.mode === "dynamic";

  useEffect(() => {
    if (data.settings.originProvinceCode) {
      setProvinceCode((current) => current || data.settings.originProvinceCode);
    }
    if (data.settings.originCityCode) {
      setCityCode((current) => current || data.settings.originCityCode);
    }
  }, [data.settings.originCityCode, data.settings.originProvinceCode]);

  return (
    <div className="space-y-6">
      <section className="admin-panel p-5 md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-xl font-black text-[#111827]">تنظیمات ارسال</h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-[#667085]">هزینه پست و تیپاکس در لحظه محاسبه و انتخاب مشتری روی سفارش ذخیره می‌شود. تحویل بسته و ثبت کد پیگیری از همین پنل و به‌صورت دستی انجام می‌شود.</p>
          </div>
          <span className={`self-start rounded-full px-3 py-1.5 text-xs font-black ${dynamicActive || readyForActivation ? "bg-[#ECFDF3] text-[#027A48]" : "bg-[#FFF7E8] text-[#B54708]"}`}>
            {dynamicActive ? "ارسال واقعی فعال" : readyForActivation ? "آماده فعال‌سازی" : "خرید با روش قبلی فعال"}
          </span>
        </div>

        <div className="mt-6 grid gap-x-6 gap-y-4 border-y border-[#E6EAF2] py-5 sm:grid-cols-2 xl:grid-cols-4">
          <Metric label="حالت تسویه‌حساب" value={dynamicActive ? "نرخ واقعی" : "روش قبلی"} ok={dynamicActive} />
          <Metric label="همگام‌سازی شهرها" value={data.environment.clientCodeConfigured && data.environment.providerIdentityConfigured ? "متصل" : "نیازمند اتصال"} ok={data.environment.ready} />
          <Metric
            label="استان / شهر / مبدا"
            value={`${data.stats.mappedProvinces.toLocaleString("fa-IR")} / ${data.stats.mappedCities.toLocaleString("fa-IR")} / ${data.stats.originMapped ? "متصل" : "نامتصل"}`}
            ok={data.stats.mappedCities > 0 && data.stats.originMapped}
          />
          <Metric label="محصول موجود بدون وزن" value={data.stats.missingWeightProducts.toLocaleString("fa-IR")} ok={data.stats.missingWeightProducts === 0} />
        </div>

        {!dynamicActive ? (
          <Notice tone="warning">
            تا کامل‌شدن موارد زیر، خرید مشتری بسته نمی‌شود و همان روش‌های قبلی فروشگاه نمایش داده می‌شوند. پس از رفع همه موارد و فعال‌کردن ارسال آنلاین، فقط نرخ واقعی آمادست پذیرفته می‌شود.
          </Notice>
        ) : null}
        {data.rollout.blockers.length ? (
          <ul className="mt-3 space-y-1 border-r-2 border-amber-400 px-3 py-2 text-xs leading-6 text-[#92400E]">
            {data.rollout.blockers.map((blocker) => <li key={blocker.code}>• {blocker.message}</li>)}
          </ul>
        ) : null}

        <form action={syncAction} className="mt-5 flex flex-col gap-3 border-t border-[#E6EAF2] pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-black text-[#111827]">فهرست استان‌ها و شهرها</p>
            <p className="mt-1 text-xs leading-6 text-[#667085]">{data.stats.lastLocationSyncAt ? `آخرین دریافت: ${new Date(data.stats.lastLocationSyncAt).toLocaleString("fa-IR")}` : "هنوز از سرویس دریافت نشده است."}</p>
          </div>
          <PendingButton
            label="دریافت شهرها از آمادست"
            pendingLabel="در حال همگام‌سازی..."
            secondary
            disabled={!data.environment.ready}
          />
        </form>
        {!data.environment.ready ? (
          <p className="mt-2 text-[11px] leading-6 text-[#92400E]">دریافت شهرها پس از ثبت اطلاعات اتصال آمادست روی سرور فعال می‌شود؛ خرید مشتری در این فاصله باز می‌ماند.</p>
        ) : null}
        <ActionMessage state={syncState} />
      </section>

      <form action={settingsAction} className="admin-panel p-5 md:p-6">
        <Section title="وضعیت و سرویس‌ها" description="این کلید پس از کامل‌شدن مبدأ، شهرها و وزن محصولات موجود، تسویه‌حساب را از روش قبلی به نرخ زنده تغییر می‌دهد.">
          <div className="grid gap-3 sm:grid-cols-3">
            <Checkbox name="enabled" label="ارسال آنلاین فعال باشد" defaultChecked={data.settings.enabled} />
            <Checkbox name="enabledCarriers" value="POST" label="پست" defaultChecked={data.settings.enabledCarriers.includes("POST")} />
            <Checkbox name="enabledCarriers" value="TIPAX" label="تیپاکس" defaultChecked={data.settings.enabledCarriers.includes("TIPAX")} />
          </div>
          <p className="mt-3 text-[11px] leading-6 text-[#667085]">فقط سرویس‌هایی نمایش داده می‌شوند که آمادست برای وزن و مقصد همان سفارش قیمت معتبر برگرداند. محدودیت اختصاصی هر محصول نیز در فرم محصول قابل تنظیم است.</p>
        </Section>

        <Section title="مبدأ محاسبه نرخ" description="این نشانی فقط مرجع داخلی فروشگاه است و در پاسخ نرخ یا صفحه مشتری نمایش داده نمی‌شود.">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-xs font-bold text-[#374151]">استان مبدا<select name="originProvinceCode" value={provinceCode} onChange={(event) => { setProvinceCode(event.target.value); setCityCode(""); }} className="mt-2"><option value="">انتخاب استان</option>{data.provinces.map((province) => <option key={province.code} value={province.code}>{province.name}</option>)}</select></label>
            <label className="text-xs font-bold text-[#374151]">شهر مبدا<select name="originCityCode" value={cityCode} onChange={(event) => setCityCode(event.target.value)} className="mt-2" disabled={!provinceCode}><option value="">انتخاب شهر</option>{cities.map((city) => <option key={city.code} value={city.code}>{city.name}</option>)}</select>{!settingsState.success && settingsState.errors?.originCityCode?.map((error) => <ErrorText key={error} text={error} />)}</label>
            <div className="md:col-span-2">
              <Field name="originAddress" label="نشانی داخلی مبدأ" defaultValue={data.settings.originAddress} errors={settingsState.success ? undefined : settingsState.errors?.originAddress} />
            </div>
          </div>
          <p className="mt-3 text-[11px] leading-6 text-[#667085]">مبدأ ثبت‌شده: اتوسرویس مانی، کرج، عظیمیه، خیابان پاسداران. محاسبه نرخ فقط با شناسه شهر کرج انجام می‌شود و مشتری نیازی به دیدن یا تأیید این آدرس ندارد.</p>
        </Section>

        <Section title="بسته‌بندی" description="وزن مرسوله از جمع وزن کالاها و این مقادیر ساخته می‌شود.">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <Field name="basePackagingWeightGrams" label="وزن پایه بسته‌بندی (گرم)" defaultValue={data.settings.basePackagingWeightGrams} type="number" min="0" />
            <Field name="extraPackagingWeightPerAdditionalItemGrams" label="وزن اضافه هر واحد (گرم)" defaultValue={data.settings.extraPackagingWeightPerAdditionalItemGrams} type="number" min="0" />
            <Field name="minimumPackageWeightGrams" label="حداقل وزن مرسوله (گرم)" defaultValue={data.settings.minimumPackageWeightGrams} type="number" min="10" />
            <Field name="defaultLengthCm" label="طول پیش‌فرض (سانتی‌متر)" defaultValue={data.settings.defaultLengthCm} type="number" min="1" />
            <Field name="defaultWidthCm" label="عرض پیش‌فرض (سانتی‌متر)" defaultValue={data.settings.defaultWidthCm} type="number" min="1" />
            <Field name="defaultHeightCm" label="ارتفاع پیش‌فرض (سانتی‌متر)" defaultValue={data.settings.defaultHeightCm} type="number" min="1" />
          </div>
        </Section>

        <Section title="قیمت‌گذاری ارسال" description="مبلغ پایه و هر تعدیل جداگانه در سفارش ذخیره می‌شود.">
          <div className="grid gap-4 md:grid-cols-2">
            <Checkbox name="freeShippingEnabled" label="ارسال رایگان از حد مشخص" defaultChecked={data.settings.freeShippingEnabled} />
            <Field name="freeShippingThresholdRials" label="حداقل خرید برای ارسال رایگان (ریال)" defaultValue={data.settings.freeShippingThresholdRials ?? ""} type="number" min="0" errors={settingsState.success ? undefined : settingsState.errors?.freeShippingThresholdRials} />
            <Field name="adjustmentFixedRials" label="تعدیل ثابت؛ منفی یعنی تخفیف (ریال)" defaultValue={data.settings.adjustmentFixedRials} type="number" />
            <Field name="adjustmentPercent" label="تعدیل درصدی؛ منفی یعنی تخفیف" defaultValue={data.settings.adjustmentPercent} type="number" step="0.01" min="-100" max="500" />
          </div>
        </Section>

        <Section title="اعتبار و زمان پاسخ" description="مقادیر محافظه‌کارانه از درخواست‌های زیاد و نرخ منقضی جلوگیری می‌کنند.">
          <div className="grid gap-4 md:grid-cols-2">
            <Field name="quoteTtlSeconds" label="اعتبار قیمت (ثانیه)" defaultValue={data.settings.quoteTtlSeconds} type="number" min="60" max="3600" />
            <Field name="providerTimeoutMs" label="مهلت پاسخ سرویس (میلی‌ثانیه)" defaultValue={data.settings.providerTimeoutMs} type="number" min="1000" max="20000" />
          </div>
        </Section>

        <ActionMessage state={settingsState} />
        <div className="mt-6 flex justify-end"><PendingButton label="ذخیره تنظیمات ارسال" pendingLabel="در حال ذخیره..." /></div>
      </form>
    </div>
  );
}

function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return <section className="border-b border-[#E6EAF2] py-6 first:pt-0"><h3 className="text-base font-black text-[#111827]">{title}</h3><p className="mt-1 text-xs leading-6 text-[#667085]">{description}</p><div className="mt-4">{children}</div></section>;
}

function Field({ label, name, defaultValue, errors, ...props }: { label: string; name: string; defaultValue: string | number; errors?: string[] } & React.InputHTMLAttributes<HTMLInputElement>) {
  return <label className="text-xs font-bold text-[#374151]">{label}<input {...props} name={name} defaultValue={defaultValue} className="mt-2" />{errors?.map((error) => <ErrorText key={error} text={error} />)}</label>;
}

function Checkbox({ label, name, value, defaultChecked }: { label: string; name: string; value?: string; defaultChecked: boolean }) {
  return <label className="flex min-h-11 items-center gap-2 text-xs font-bold text-[#374151]"><input type="checkbox" name={name} value={value} defaultChecked={defaultChecked} className="size-4 accent-[#F59E0B]" />{label}</label>;
}

function Metric({ label, value, ok }: { label: string; value: string; ok: boolean }) {
  return <div><p className="text-[11px] font-bold text-[#667085]">{label}</p><p className={`mt-1 text-sm font-black ${ok ? "text-[#027A48]" : "text-[#B54708]"}`}>{value}</p></div>;
}

function Notice({ children, tone }: { children: React.ReactNode; tone: "warning" | "danger" }) {
  return <p className={`mt-4 border-r-2 px-3 py-2 text-xs leading-6 ${tone === "danger" ? "border-red-400 text-[#B42318]" : "border-amber-400 text-[#92400E]"}`}>{children}</p>;
}

function ActionMessage({ state }: { state: ActionResult }) {
  if (!state.message) return null;
  return <p className={`mt-4 border-r-2 px-3 py-2 text-xs font-bold leading-6 ${state.success ? "border-green-500 text-[#027A48]" : "border-red-400 text-[#B42318]"}`}>{state.message}</p>;
}

function ErrorText({ text }: { text: string }) {
  return <span className="mt-1 block text-[11px] text-[#B42318]">{text}</span>;
}

function PendingButton({ label, pendingLabel, secondary = false, disabled = false }: { label: string; pendingLabel: string; secondary?: boolean; disabled?: boolean }) {
  const { pending } = useFormStatus();
  return <button type="submit" disabled={pending || disabled} className={`${secondary ? "btn-outline" : "btn-primary"} min-h-11 px-4 text-xs`}>{pending ? pendingLabel : label}</button>;
}
