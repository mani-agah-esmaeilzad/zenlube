"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { saveTorobOrderTrackingAction } from "@/actions/admin";

type Data = {
  enabled: boolean;
  endpointUrl: string;
  attributedOrders: number;
  eligibleOrders: number;
};

const initialState = { success: false } as const;

export function TorobOrdersTab({ data }: { data: Data }) {
  const [state, action] = useActionState(saveTorobOrderTrackingAction, initialState);

  return (
    <div className="space-y-5">
      <section className="admin-panel p-5 md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-[#667085]">اتصال اختصاصی فروشگاه</p>
            <h2 className="mt-2 text-xl font-black text-[#111827]">همگام‌سازی سفارش‌های ترب</h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-[#667085]">
              ترب می‌تواند فقط سفارش‌هایی را دریافت کند که با شناسه کلیک خودش وارد سایت شده‌اند. این API جدا از خروجی محصولات و سایت‌مپ کار می‌کند.
            </p>
          </div>
          <span className={`rounded-full px-3 py-1.5 text-xs font-black ${data.enabled ? "bg-[#ECFDF3] text-[#027A48]" : "bg-[#F2F4F7] text-[#475467]"}`}>
            {data.enabled ? "دسترسی فعال" : "دسترسی غیرفعال"}
          </span>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <Metric label="سفارش‌های ثبت‌شده با کلیک ترب" value={data.attributedOrders} />
          <Metric label="سفارش‌های قابل همگام‌سازی" value={data.eligibleOrders} />
        </div>

        <div className="mt-5 rounded-2xl border border-[#E6EAF2] bg-[#F8FAFC] p-4">
          <p className="text-xs font-bold text-[#667085]">آدرس API برای ثبت در پنل ترب</p>
          <code dir="ltr" className="mt-2 block break-all text-sm font-bold text-[#344054]">{data.endpointUrl}</code>
        </div>

        <div className="mt-5 rounded-2xl border border-[#FDE68A] bg-[#FFFBEB] p-4 text-sm leading-7 text-[#854D0E]">
          شناسه کلیک به‌صورت امن تا ۷ روز نگه‌داری می‌شود. اطلاعات فقط با توکن امضاشده ترب ارائه می‌شود؛ سفارش‌های عادی فروشگاه در خروجی نیستند. وضعیت‌های پرداخت‌شده و لغوشده همگام می‌شوند.
        </div>
      </section>

      <form action={action} className="admin-panel p-5 md:p-6">
        <label className="flex cursor-pointer items-start gap-3">
          <input name="enabled" type="checkbox" defaultChecked={data.enabled} className="mt-1 h-5 w-5 accent-[#E11D48]" />
          <span>
            <span className="block text-sm font-black text-[#111827]">اجازه دسترسی ترب به API سفارش‌ها</span>
            <span className="mt-1 block text-xs leading-6 text-[#667085]">خاموش‌کردن این گزینه، درخواست‌های API را با پاسخ ۴۰۳ رد می‌کند.</span>
          </span>
        </label>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <SaveButton />
          {state.message ? <p role="status" className={`text-sm font-bold ${state.success ? "text-[#027A48]" : "text-[#B42318]"}`}>{state.message}</p> : null}
        </div>
      </form>
    </div>
  );
}

function SaveButton() {
  const { pending } = useFormStatus();
  return <button type="submit" disabled={pending} className="btn-primary disabled:opacity-60">{pending ? "در حال ذخیره..." : "ذخیره دسترسی"}</button>;
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-[#E6EAF2] p-4">
      <p className="text-xs font-bold text-[#667085]">{label}</p>
      <p className="mt-2 text-2xl font-black text-[#111827]">{value.toLocaleString("fa-IR")}</p>
    </div>
  );
}
