"use client";

import { useActionState, useEffect, useMemo, useRef } from "react";

import { createCategoryAction, updateCategoryAction } from "@/actions/admin";
import type { ActionResult } from "@/actions/admin/types";
import type { CategoriesTabData } from "@/services/admin/types";
import { MediaUploadField } from "@/components/admin/media-upload-field";

type FormState = { status: "idle" } | { status: "submitted"; result: ActionResult };

const initialState: FormState = { status: "idle" };

type CategoryFormProps = {
  defaultValues?: Partial<CategoryDefaultValues>;
};

export function CategoryCreateForm({ defaultValues = {} }: CategoryFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(createReducer, initialState);

  useEffect(() => {
    if (state.status === "submitted" && state.result.success) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <CategoryFields submitLabel="ذخیره دسته" state={state} disabled={isPending} defaultValues={defaultValues} />
    </form>
  );
}

export function CategoryEditForm({ category }: { category: CategoriesTabData["categories"][number] }) {
  const [state, formAction, isPending] = useActionState(updateReducer, initialState);
  const defaults = useMemo<CategoryDefaultValues>(
    () => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      imageUrl: category.imageUrl ?? "",
      description: category.description ?? "",
    }),
    [category],
  );

  return (
    <form action={formAction} className="space-y-3 text-xs">
      <input type="hidden" name="id" value={defaults.id} />
      <CategoryFields submitLabel="به‌روزرسانی" state={state} disabled={isPending} defaultValues={defaults} />
    </form>
  );
}

type CategoryDefaultValues = {
  id?: string;
  name?: string;
  slug?: string;
  imageUrl?: string;
  description?: string;
};

type CategoryFieldsProps = {
  submitLabel: string;
  state: FormState;
  disabled: boolean;
  defaultValues: Partial<CategoryDefaultValues>;
};

function CategoryFields({ submitLabel, state, disabled, defaultValues }: CategoryFieldsProps) {
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
        نام دسته
        <input
          name="name"
          defaultValue={defaultValues.name ?? ""}
          placeholder="نام دسته"
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
          placeholder="engine-oil"
          disabled={disabled}
          className="w-full rounded-full border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-900"
        />
        {renderErrors("slug")}
      </label>
      <div>
        <MediaUploadField
          name="imageUrl"
          label="تصویر دسته (اختیاری)"
          defaultValue={defaultValues.imageUrl}
          description="آپلود تصویر برای نمایش در کارت‌های دسته‌بندی."
          disabled={disabled}
        />
        {renderErrors("imageUrl")}
      </div>
      <label className="flex flex-col gap-1 text-xs text-slate-500">
        توضیحات کوتاه
        <textarea
          name="description"
          defaultValue={defaultValues.description ?? ""}
          placeholder="چه محصولاتی در این دسته هستند؟"
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
  const result = await createCategoryAction(formData);
  return { status: "submitted", result };
}

async function updateReducer(_: FormState, formData: FormData): Promise<FormState> {
  const result = await updateCategoryAction(formData);
  return { status: "submitted", result };
}
