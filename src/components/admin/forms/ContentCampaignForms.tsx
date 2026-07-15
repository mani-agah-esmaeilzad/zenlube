"use client";

import { useActionState, useEffect, useRef } from "react";

import { saveCouponAction, saveMarketingBannerAction } from "@/actions/admin";
import type { ActionResult } from "@/actions/admin/types";

type FormState = { status: "idle" } | { status: "submitted"; result: ActionResult };

const initialState: FormState = { status: "idle" };

export function BannerCreateForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(saveBannerReducer, initialState);

  useEffect(() => {
    if (state.status === "submitted" && state.result.success) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="rounded-2xl border border-dashed border-[#E5E7EB] p-4">
      <p className="text-sm font-bold text-[#111827]">افزودن بنر</p>
      <div className="mt-3 grid gap-3">
        <Field name="title" placeholder="عنوان بنر" errors={readErrors(state, "title")} disabled={isPending} />
        <Field name="subtitle" placeholder="زیرعنوان" errors={readErrors(state, "subtitle")} disabled={isPending} />
        <Field name="ctaLabel" placeholder="متن CTA" errors={readErrors(state, "ctaLabel")} disabled={isPending} />
        <Field name="ctaLink" placeholder="لینک CTA" errors={readErrors(state, "ctaLink")} disabled={isPending} />
        <Field name="imageUrl" placeholder="آدرس تصویر" errors={readErrors(state, "imageUrl")} disabled={isPending} />
        <Field name="position" defaultValue="homepage-hero" placeholder="جایگاه" errors={readErrors(state, "position")} disabled={isPending} />
        <label className="flex items-center gap-2 text-xs font-bold text-[#374151]">
          <input type="checkbox" name="isActive" defaultChecked className="size-4 accent-[#F59E0B]" disabled={isPending} />
          فعال
        </label>
        <ActionStateMessage state={state} />
        <button type="submit" disabled={isPending} className="btn-primary disabled:cursor-not-allowed disabled:opacity-60">
          {isPending ? "در حال ذخیره..." : "ذخیره بنر"}
        </button>
      </div>
    </form>
  );
}

export function CouponCreateForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(saveCouponReducer, initialState);

  useEffect(() => {
    if (state.status === "submitted" && state.result.success) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="rounded-2xl border border-dashed border-[#E5E7EB] p-4">
      <p className="text-sm font-bold text-[#111827]">ایجاد کد تخفیف</p>
      <div className="mt-3 grid gap-3">
        <Field name="code" placeholder="مثلاً OILBAR10" errors={readErrors(state, "code")} disabled={isPending} />
        <Field name="title" placeholder="عنوان کمپین" errors={readErrors(state, "title")} disabled={isPending} />
        <select name="discountType" className="input-zen" defaultValue="PERCENTAGE" disabled={isPending}>
          <option value="PERCENTAGE">درصدی</option>
          <option value="FIXED">مبلغ ثابت</option>
        </select>
        <Field name="amount" placeholder="مقدار تخفیف" errors={readErrors(state, "amount")} disabled={isPending} />
        <Field name="minOrderAmount" placeholder="حداقل مبلغ سفارش" errors={readErrors(state, "minOrderAmount")} disabled={isPending} />
        <Field name="maxDiscountAmount" placeholder="سقف تخفیف" errors={readErrors(state, "maxDiscountAmount")} disabled={isPending} />
        <Field name="usageLimit" placeholder="محدودیت مصرف" errors={readErrors(state, "usageLimit")} disabled={isPending} />
        <Field name="startsAt" type="datetime-local" errors={readErrors(state, "startsAt")} disabled={isPending} />
        <Field name="endsAt" type="datetime-local" errors={readErrors(state, "endsAt")} disabled={isPending} />
        <label className="flex items-center gap-2 text-xs font-bold text-[#374151]">
          <input type="checkbox" name="isActive" defaultChecked className="size-4 accent-[#F59E0B]" disabled={isPending} />
          فعال
        </label>
        <ActionStateMessage state={state} />
        <button type="submit" disabled={isPending} className="btn-primary disabled:cursor-not-allowed disabled:opacity-60">
          {isPending ? "در حال ذخیره..." : "ذخیره کد تخفیف"}
        </button>
      </div>
    </form>
  );
}

function Field({
  name,
  placeholder,
  errors,
  disabled,
  defaultValue,
  type = "text",
}: {
  name: string;
  placeholder?: string;
  errors?: string[];
  disabled?: boolean;
  defaultValue?: string;
  type?: string;
}) {
  return (
    <label className="text-xs font-bold text-[#374151]">
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        disabled={disabled}
        className="input-zen"
      />
      {errors?.map((error) => (
        <span key={error} className="mt-1 block text-[11px] text-[#DC2626]">
          {error}
        </span>
      ))}
    </label>
  );
}

function ActionStateMessage({ state }: { state: FormState }) {
  if (state.status !== "submitted") {
    return null;
  }

  if (state.result.success) {
    return <p className="rounded-2xl bg-green-50 px-4 py-3 text-xs font-bold text-[#16A34A]">تغییرات با موفقیت ثبت شد.</p>;
  }

  if (state.result.message) {
    return <p className="rounded-2xl bg-red-50 px-4 py-3 text-xs font-bold text-[#DC2626]">{state.result.message}</p>;
  }

  return null;
}

function readErrors(state: FormState, field: string) {
  if (state.status !== "submitted" || state.result.success) {
    return undefined;
  }

  return state.result.errors?.[field];
}

async function saveBannerReducer(_: FormState, formData: FormData): Promise<FormState> {
  const result = await saveMarketingBannerAction(formData);
  return { status: "submitted", result };
}

async function saveCouponReducer(_: FormState, formData: FormData): Promise<FormState> {
  const result = await saveCouponAction(formData);
  return { status: "submitted", result };
}
