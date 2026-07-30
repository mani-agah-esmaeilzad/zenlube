"use client";

import { useActionState, useEffect, useMemo, useRef } from "react";

import { saveCarAction } from "@/actions/admin";
import type { ActionResult } from "@/actions/admin/types";
import type { CarsTabData } from "@/services/admin/types";
import { MediaUploadField } from "@/components/admin/media-upload-field";

type FormState = { status: "idle" } | { status: "submitted"; result: ActionResult };

const initialState: FormState = { status: "idle" };

type CarEditorFormProps = {
  car?: CarsTabData["cars"][number] | null;
  onReset: () => void;
};

type CarDefaultValues = {
  id?: string;
  slug?: string;
  manufacturer?: string;
  model?: string;
  generation?: string;
  imageUrl?: string;
  engineType?: string;
  engineCode?: string;
  viscosity?: string;
  oilCapacityLit?: string;
  specification?: string;
  yearFrom?: string;
  yearTo?: string;
  overviewDetails?: string;
  engineDetails?: string;
  gearboxDetails?: string;
  maintenanceInfo?: string;
  isActive?: boolean;
};

export function CarEditorForm({ car, onReset }: CarEditorFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(saveReducer, initialState);
  const defaultValues = useMemo<CarDefaultValues>(() => {
    if (!car) {
      return { isActive: true };
    }

    return {
      id: car.id,
      slug: car.slug,
      manufacturer: car.manufacturer,
      model: car.model,
      generation: car.generation ?? "",
      imageUrl: car.imageUrl ?? "",
      engineType: car.engineType ?? "",
      engineCode: car.engineCode ?? "",
      viscosity: car.viscosity ?? "",
      oilCapacityLit: car.oilCapacityLit != null ? String(car.oilCapacityLit) : "",
      specification: car.specification ?? "",
      yearFrom: car.yearFrom != null ? String(car.yearFrom) : "",
      yearTo: car.yearTo != null ? String(car.yearTo) : "",
      overviewDetails: car.overviewDetails ?? "",
      engineDetails: car.engineDetails ?? "",
      gearboxDetails: car.gearboxDetails ?? "",
      maintenanceInfo: car.maintenanceInfo ?? "",
      isActive: car.isActive,
    };
  }, [car]);

  useEffect(() => {
    if (state.status !== "submitted" || !state.result.success) {
      return;
    }

    if (!car) {
      formRef.current?.reset();
    }

    onReset();
  }, [car, onReset, state]);

  return (
    <form ref={formRef} action={formAction} className="mt-6 grid gap-4 sm:grid-cols-2">
      {defaultValues.id ? <input type="hidden" name="id" value={defaultValues.id} /> : null}
      <CarFormFields
        defaultValues={defaultValues}
        disabled={isPending}
        isEditing={Boolean(car)}
        state={state}
        onCancel={onReset}
      />
    </form>
  );
}

function CarFormFields({
  defaultValues,
  disabled,
  isEditing,
  state,
  onCancel,
}: {
  defaultValues: CarDefaultValues;
  disabled: boolean;
  isEditing: boolean;
  state: FormState;
  onCancel: () => void;
}) {
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
      <div className="sm:col-span-2 flex items-start justify-between gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">{isEditing ? "ویرایش اطلاعات خودرو" : "ثبت خودروی جدید"}</h3>
          <p className="mt-1 text-xs leading-6 text-slate-500">
            {isEditing
              ? "تغییرات اطلاعات دفترچه‌ای، وضعیت نمایش و مشخصات فنی را ثبت کنید."
              : "برای ثبت خودرو، اطلاعات فنی و محتوای دفترچه را وارد کنید."}
          </p>
        </div>
        {isEditing ? (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-white"
          >
            لغو ویرایش
          </button>
        ) : null}
      </div>

      <label className="sm:col-span-2 flex items-start gap-3 rounded-3xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
        <input
          type="checkbox"
          name="isActive"
          defaultChecked={defaultValues.isActive ?? true}
          disabled={disabled}
          className="mt-1 h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
        />
        <span className="space-y-1">
          <span className="block font-semibold text-slate-900">نمایش خودرو در سایت</span>
          <span className="block text-xs leading-6 text-slate-500">
            اگر این گزینه غیرفعال شود، خودرو از صفحات سایت، جستجو، انتخاب خودرو و سازگاری محصولات پنهان می‌شود.
          </span>
        </span>
      </label>
      {renderErrors("isActive")}

      <label className="flex flex-col gap-1 text-xs text-slate-500">
        اسلاگ خودرو
        <input
          name="slug"
          defaultValue={defaultValues.slug ?? ""}
          placeholder="bmw-320i-f30"
          disabled={disabled}
          className="rounded-full border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-900"
        />
        {renderErrors("slug")}
      </label>
      <label className="flex flex-col gap-1 text-xs text-slate-500">
        سازنده
        <input
          name="manufacturer"
          defaultValue={defaultValues.manufacturer ?? ""}
          placeholder="سازنده"
          disabled={disabled}
          className="rounded-full border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-900"
        />
        {renderErrors("manufacturer")}
      </label>
      <label className="flex flex-col gap-1 text-xs text-slate-500">
        مدل
        <input
          name="model"
          defaultValue={defaultValues.model ?? ""}
          placeholder="مدل"
          disabled={disabled}
          className="rounded-full border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-900"
        />
        {renderErrors("model")}
      </label>
      <label className="flex flex-col gap-1 text-xs text-slate-500">
        نسل / تیپ
        <input
          name="generation"
          defaultValue={defaultValues.generation ?? ""}
          placeholder="نسل / تیپ (اختیاری)"
          disabled={disabled}
          className="rounded-full border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-900"
        />
        {renderErrors("generation")}
      </label>
      <div className="sm:col-span-2">
        <MediaUploadField
          name="imageUrl"
          label="آدرس تصویر یا جلد دفترچه"
          defaultValue={defaultValues.imageUrl}
          description="از آپلود استفاده کنید یا آدرس مستقیم تصویر را وارد کنید."
          disabled={disabled}
        />
        {renderErrors("imageUrl")}
      </div>
      <label className="flex flex-col gap-1 text-xs text-slate-500">
        نوع موتور
        <input
          name="engineType"
          defaultValue={defaultValues.engineType ?? ""}
          placeholder="نوع موتور"
          disabled={disabled}
          className="rounded-full border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-900"
        />
        {renderErrors("engineType")}
      </label>
      <label className="flex flex-col gap-1 text-xs text-slate-500">
        کد موتور
        <input
          name="engineCode"
          defaultValue={defaultValues.engineCode ?? ""}
          placeholder="کد موتور (اختیاری)"
          disabled={disabled}
          className="rounded-full border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-900"
        />
        {renderErrors("engineCode")}
      </label>
      <label className="flex flex-col gap-1 text-xs text-slate-500">
        ویسکوزیته پیشنهادی
        <input
          name="viscosity"
          defaultValue={defaultValues.viscosity ?? ""}
          placeholder="SAE 5W-30"
          disabled={disabled}
          className="rounded-full border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-900"
        />
        {renderErrors("viscosity")}
      </label>
      <label className="flex flex-col gap-1 text-xs text-slate-500">
        ظرفیت روغن موتور (لیتر)
        <input
          name="oilCapacityLit"
          defaultValue={defaultValues.oilCapacityLit ?? ""}
          placeholder="مثال: 4.8"
          disabled={disabled}
          className="rounded-full border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-900"
        />
        {renderErrors("oilCapacityLit")}
      </label>
      <label className="sm:col-span-2 flex flex-col gap-1 text-xs text-slate-500">
        استاندارد سازنده
        <input
          name="specification"
          defaultValue={defaultValues.specification ?? ""}
          placeholder="مثال: VW 504.00"
          disabled={disabled}
          className="rounded-full border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-900"
        />
        {renderErrors("specification")}
      </label>
      <label className="flex flex-col gap-1 text-xs text-slate-500">
        سال شروع تولید
        <input
          name="yearFrom"
          defaultValue={defaultValues.yearFrom ?? ""}
          placeholder="سال شروع تولید"
          disabled={disabled}
          className="rounded-full border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-900"
        />
        {renderErrors("yearFrom")}
      </label>
      <label className="flex flex-col gap-1 text-xs text-slate-500">
        سال پایان تولید
        <input
          name="yearTo"
          defaultValue={defaultValues.yearTo ?? ""}
          placeholder="سال پایان تولید"
          disabled={disabled}
          className="rounded-full border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-900"
        />
        {renderErrors("yearTo")}
      </label>
      <label className="sm:col-span-2 flex flex-col gap-1 text-xs text-slate-500">
        معرفی کلی خودرو
        <textarea
          name="overviewDetails"
          defaultValue={defaultValues.overviewDetails ?? ""}
          placeholder="صفحه مقدمه دفترچه: معرفی کلی خودرو"
          disabled={disabled}
          className="h-28 rounded-3xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-900"
        />
        {renderErrors("overviewDetails")}
      </label>
      <label className="sm:col-span-2 flex flex-col gap-1 text-xs text-slate-500">
        جزئیات موتور
        <textarea
          name="engineDetails"
          defaultValue={defaultValues.engineDetails ?? ""}
          placeholder="صفحه موتور: ساختار فنی، ظرفیت، روغن و توصیه‌های سرویس"
          disabled={disabled}
          className="h-32 rounded-3xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-900"
        />
        {renderErrors("engineDetails")}
      </label>
      <label className="sm:col-span-2 flex flex-col gap-1 text-xs text-slate-500">
        جزئیات گیربکس
        <textarea
          name="gearboxDetails"
          defaultValue={defaultValues.gearboxDetails ?? ""}
          placeholder="صفحه گیربکس: نوع جعبه‌دنده، روغن مناسب، ظرفیت و دوره‌های سرویس"
          disabled={disabled}
          className="h-32 rounded-3xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-900"
        />
        {renderErrors("gearboxDetails")}
      </label>
      <label className="sm:col-span-2 flex flex-col gap-1 text-xs text-slate-500">
        برنامه نگهداری
        <textarea
          name="maintenanceInfo"
          defaultValue={defaultValues.maintenanceInfo ?? ""}
          placeholder="صفحه نگهداری: برنامه بازدیدها، سیالات مصرفی و نکات تخصصی"
          disabled={disabled}
          className="h-32 rounded-3xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-900"
        />
        {renderErrors("maintenanceInfo")}
      </label>

      {globalError ? (
        <p className="sm:col-span-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-[11px] text-red-600">
          {globalError}
        </p>
      ) : null}
      {showSuccess ? (
        <p className="sm:col-span-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-[11px] text-emerald-700">
          اطلاعات خودرو با موفقیت ذخیره شد.
        </p>
      ) : null}

      <div className="sm:col-span-2 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={disabled}
          className="rounded-full bg-sky-500 px-6 py-2 text-sm font-semibold text-slate-900 transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {disabled ? "در حال ذخیره..." : isEditing ? "به‌روزرسانی خودرو" : "ذخیره خودرو"}
        </button>
        {isEditing ? (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-slate-200 px-6 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
          >
            انصراف
          </button>
        ) : null}
      </div>
    </>
  );
}

async function saveReducer(_: FormState, formData: FormData): Promise<FormState> {
  const result = await saveCarAction(formData);
  return { status: "submitted", result };
}
