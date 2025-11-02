"use client";

import { useActionState, useEffect, useMemo, useRef } from "react";

import { createBrandAction, updateBrandAction } from "@/actions/admin";
import type { ActionResult } from "@/actions/admin/types";
import type { BrandsTabData } from "@/services/admin/types";
import { MediaUploadField } from "@/components/admin/media-upload-field";

type FormState = { status: "idle" } | { status: "submitted"; result: ActionResult };

const initialState: FormState = { status: "idle" };

type BrandFormProps = {
  defaultValues?: Partial<BrandDefaultValues>;
};

export function BrandCreateForm({ defaultValues = {} }: BrandFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(createReducer, initialState);
  useEffect(() => {
    if (state.status === "submitted" && state.result.success) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="mt-6 space-y-4">
      <BrandFields submitLabel="ذخیره برند" state={state} disabled={isPending} defaultValues={defaultValues} />
    </form>
  );
}

export function BrandEditForm({ brand }: { brand: BrandsTabData["brands"][number] }) {
  const [state, formAction, isPending] = useActionState(updateReducer, initialState);
  const defaults = useMemo<BrandDefaultValues>(
    () => ({
      id: brand.id,
      name: brand.name,
      slug: brand.slug,
      imageUrl: brand.imageUrl ?? "",
      website: brand.website ?? "",
      description: brand.description ?? "",
    }),
    [brand],
  );

  return (
    <form action={formAction} className="space-y-3 text-xs">
      <input type="hidden" name="id" value={defaults.id} />
      <BrandFields submitLabel="به‌روزرسانی" state={state} disabled={isPending} defaultValues={defaults} />
    </form>
  );
}

type BrandDefaultValues = {
  id?: string;
  name?: string;
  slug?: string;
  imageUrl?: string;
  website?: string;
  description?: string;
};

type BrandFieldsProps = {
  submitLabel: string;
  state: FormState;
  disabled: boolean;
  defaultValues: Partial<BrandDefaultValues>;
};

function BrandFields({ submitLabel, state, disabled, defaultValues }: BrandFieldsProps) {
  const renderErrors = (field: string) => {
    if (state.status !== "submitted" || state.result.success) {
      return null;
    }
    const errors = state.result.errors?.[field];
    if (!errors?.length) {
      return null;
    }
    return <span className="text-[11px] text-red-500">{errors.join(" ")}</span>;
  };

  const globalError =
    state.status === "submitted" && !state.result.success && state.result.message ? state.result.message : null;
  const showSuccess = state.status === "submitted" && state.result.success;

  return (
    <>
      <label className="flex flex-col gap-1 text-xs text-slate-500">
        نام برند
        <input
          name="name"
          defaultValue={defaultValues.name ?? ""}
          placeholder="نام برند"
          disabled={disabled}
          className="w-full rounded-full border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-900"
        />
        {renderErrors("name")}
      </label>
      <label className="flex flex-col gap-1 text-xs text-slate-500">
        اسلاگ
        <input
          name="slug"
          defaultValue={defaultValues.slug ?? ""}
          placeholder="mobil-1"
          disabled={disabled}
          className="w-full rounded-full border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-900"
        />
        {renderErrors("slug")}
      </label>
      <div>
        <MediaUploadField
          name="imageUrl"
          label="تصویر برند"
          defaultValue={defaultValues.imageUrl}
          description="یک تصویر ۱:۱ با پس‌زمینه شفاف یا سفید آپلود کنید یا آدرس مستقیم وارد نمایید."
          disabled={disabled}
        />
        {renderErrors("imageUrl")}
      </div>
      <label className="flex flex-col gap-1 text-xs text-slate-500">
        وب‌سایت رسمی
        <input
          name="website"
          defaultValue={defaultValues.website ?? ""}
          placeholder="https://mobil.com"
          disabled={disabled}
          className="w-full rounded-full border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-900"
        />
        {renderErrors("website")}
      </label>
      <label className="flex flex-col gap-1 text-xs text-slate-500">
        توضیحات کوتاه
        <textarea
          name="description"
          defaultValue={defaultValues.description ?? ""}
          placeholder="چرا این برند مهم است؟"
          disabled={disabled}
          className="h-24 w-full rounded-3xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-900"
        />
        {renderErrors("description")}
      </label>

      {globalError ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-[11px] text-red-600">{globalError}</p>
      ) : null}
      {showSuccess ? (
        <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-[11px] text-emerald-700">
          تغییرات با موفقیت ثبت شد.
        </p>
      ) : null}

      <button
        type="submit"
        disabled={disabled}
        className="rounded-full bg-sky-500 px-6 py-2 text-sm font-semibold text-slate-900 transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {disabled ? "در حال ذخیره..." : submitLabel}
      </button>
    </>
  );
}

async function createReducer(_: FormState, formData: FormData): Promise<FormState> {
  const result = await createBrandAction(formData);
  return { status: "submitted", result };
}

async function updateReducer(_: FormState, formData: FormData): Promise<FormState> {
  const result = await updateBrandAction(formData);
  return { status: "submitted", result };
}
