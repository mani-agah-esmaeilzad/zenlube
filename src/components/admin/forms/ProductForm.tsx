"use client";

import { useActionState, useEffect, useMemo, useRef } from "react";

import { createProductAction, updateProductAction } from "@/actions/admin";
import type { ActionResult } from "@/actions/admin/types";
import type { ProductsTabData } from "@/services/admin/types";
import { faNumberFormatter } from "@/lib/formatters";
import { MediaUploadField } from "@/components/admin/media-upload-field";

type FormState = { status: "idle" } | { status: "submitted"; result: ActionResult };

const initialState: FormState = { status: "idle" };

type ProductFormBaseProps = {
  categories: ProductsTabData["categories"];
  brands: ProductsTabData["brands"];
  cars: ProductsTabData["cars"];
  submitLabel: string;
  defaultValues?: Partial<ProductDefaultValues>;
};

export function ProductCreateForm(props: Omit<ProductFormBaseProps, "submitLabel">) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(createProductReducer, initialState);

  useEffect(() => {
    if (state.status === "submitted" && state.result.success) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="mt-6 grid gap-4 sm:grid-cols-2">
      <ProductFormFields
        {...props}
        submitLabel="ذخیره محصول"
        state={state}
        disabled={isPending}
        defaultValues={props.defaultValues}
      />
    </form>
  );
}

export function ProductEditForm(
  props: Omit<ProductFormBaseProps, "submitLabel"> & {
    product: ProductsTabData["products"][number];
  },
) {
  const [state, formAction, isPending] = useActionState(updateProductReducer, initialState);
  const defaultValues = useMemo<ProductDefaultValues>(() => {
    const { product } = props;
    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      sku: product.sku ?? "",
      price: String(product.price),
      stock: String(product.stock),
      viscosity: product.viscosity ?? "",
      oilType: product.oilType ?? "",
      imageUrl: product.imageUrl ?? "",
      description: product.description ?? "",
      categoryId: product.category.id,
      brandId: product.brand.id,
      isFeatured: product.isFeatured,
      carIds: product.carMappings.map(({ car }) => car.id),
    };
  }, [props]);

  return (
    <form action={formAction} className="grid gap-3 text-xs">
      <input type="hidden" name="id" value={defaultValues.id} />
      <ProductFormFields
        {...props}
        submitLabel="به‌روزرسانی"
        state={state}
        disabled={isPending}
        defaultValues={defaultValues}
      />
    </form>
  );
}

type ProductDefaultValues = {
  id?: string;
  name?: string;
  slug?: string;
  sku?: string;
  price?: string;
  stock?: string;
  viscosity?: string;
  oilType?: string;
  imageUrl?: string;
  description?: string;
  categoryId?: string;
  brandId?: string;
  isFeatured?: boolean;
  carIds?: string[];
};

type ProductFormFieldsProps = ProductFormBaseProps & {
  state: FormState;
  disabled: boolean;
  defaultValues?: Partial<ProductDefaultValues>;
};

function ProductFormFields({
  categories,
  brands,
  cars,
  submitLabel,
  state,
  disabled,
  defaultValues = {},
}: ProductFormFieldsProps) {
  const selectedCategory = defaultValues.categoryId ?? categories[0]?.id ?? "";
  const selectedBrand = defaultValues.brandId ?? brands[0]?.id ?? "";
  const carDefaultValues = defaultValues.carIds ?? [];
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
      <div className="sm:col-span-2 grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-xs text-slate-500">
          نام محصول
          <input
            name="name"
            defaultValue={defaultValues.name ?? ""}
            placeholder="نام محصول"
            disabled={disabled}
            className="rounded-full border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-900"
          />
          {renderErrors("name")}
        </label>
        <label className="flex flex-col gap-1 text-xs text-slate-500">
          اسلاگ
          <input
            name="slug"
            defaultValue={defaultValues.slug ?? ""}
            placeholder="mobil-1-5w30"
            disabled={disabled}
            className="rounded-full border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-900"
          />
          {renderErrors("slug")}
        </label>
        <label className="flex flex-col gap-1 text-xs text-slate-500">
          کد محصول / SKU
          <input
            name="sku"
            defaultValue={defaultValues.sku ?? ""}
            placeholder="SKU"
            disabled={disabled}
            className="rounded-full border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-900"
          />
          {renderErrors("sku")}
        </label>
        <label className="flex flex-col gap-1 text-xs text-slate-500">
          قیمت (ریال)
          <input
            name="price"
            defaultValue={defaultValues.price ?? ""}
            placeholder="مثال: ۲۵۰۰۰۰۰"
            disabled={disabled}
            className="rounded-full border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-900"
          />
          {renderErrors("price")}
        </label>
        <label className="flex flex-col gap-1 text-xs text-slate-500">
          موجودی انبار
          <input
            name="stock"
            defaultValue={defaultValues.stock ?? ""}
            placeholder="مثال: ۴۰"
            disabled={disabled}
            className="rounded-full border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-900"
          />
          {renderErrors("stock")}
        </label>
        <label className="flex flex-col gap-1 text-xs text-slate-500">
          ویسکوزیته
          <input
            name="viscosity"
            defaultValue={defaultValues.viscosity ?? ""}
            placeholder="5W-30"
            disabled={disabled}
            className="rounded-full border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-900"
          />
          {renderErrors("viscosity")}
        </label>
        <label className="flex flex-col gap-1 text-xs text-slate-500">
          نوع روغن
          <input
            name="oilType"
            defaultValue={defaultValues.oilType ?? ""}
            placeholder="تمام سنتتیک"
            disabled={disabled}
            className="rounded-full border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-900"
          />
          {renderErrors("oilType")}
        </label>
        <div className="sm:col-span-2">
          <MediaUploadField
            name="imageUrl"
            label="آدرس تصویر محصول"
            defaultValue={defaultValues.imageUrl}
            description="از دکمه آپلود برای انتخاب تصویر یا وارد کردن آدرس مستقیم استفاده کنید."
            disabled={disabled}
          />
          {renderErrors("imageUrl")}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-xs text-slate-500">
          دسته‌بندی
          <select
            name="categoryId"
            defaultValue={selectedCategory}
            disabled={disabled}
            className="rounded-full border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-900"
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {renderErrors("categoryId")}
        </label>
        <label className="flex flex-col gap-1 text-xs text-slate-500">
          برند
          <select
            name="brandId"
            defaultValue={selectedBrand}
            disabled={disabled}
            className="rounded-full border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-900"
          >
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </select>
          {renderErrors("brandId")}
        </label>
        <label className="sm:col-span-2 flex flex-col gap-1 text-xs text-slate-500">
          خودروهای سازگار
          <select
            name="carIds"
            multiple
            defaultValue={carDefaultValues}
            disabled={disabled}
            className="h-40 w-full rounded-3xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-900"
          >
            {cars.map((car) => (
              <option key={car.id} value={car.id}>
                {car.manufacturer} {car.model} {car.generation ?? ""}
              </option>
            ))}
          </select>
          <span className="text-[11px] text-slate-400">
            با نگه داشتن کلیدهای Ctrl یا Cmd می‌توانید چند خودرو را همزمان انتخاب کنید.
          </span>
          {renderErrors("carIds")}
        </label>
      </div>

      <label className="flex items-center gap-2 text-xs text-slate-500">
        <input
          type="checkbox"
          name="isFeatured"
          defaultChecked={defaultValues.isFeatured ?? false}
          disabled={disabled}
          className="h-5 w-5 rounded border border-slate-200 bg-slate-100"
        />
        نمایش در محصولات ویژه
      </label>

      <label className="sm:col-span-2 flex flex-col gap-1 text-xs text-slate-500">
        توضیحات محصول
        <textarea
          name="description"
          defaultValue={defaultValues.description ?? ""}
          placeholder="مزایا، ترکیب و موارد مصرف محصول"
          disabled={disabled}
          className="h-28 rounded-3xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-900"
        />
        {renderErrors("description")}
      </label>

      {globalError ? (
        <p className="sm:col-span-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-[11px] text-red-600">
          {globalError}
        </p>
      ) : null}

      {showSuccess ? (
        <p className="sm:col-span-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-[11px] text-emerald-700">
          تغییرات با موفقیت ثبت شد.
        </p>
      ) : null}

      <div className="sm:col-span-2 flex items-center justify-between gap-3">
        <button
          type="submit"
          disabled={disabled}
          className="rounded-full bg-sky-500 px-6 py-2 text-sm font-semibold text-slate-900 transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {disabled ? "در حال ذخیره..." : submitLabel}
        </button>
        <span className="text-[11px] text-slate-400">
          {faNumberFormatter.format(brands.length)} برند و {faNumberFormatter.format(categories.length)} دسته برای انتخاب موجود است.
        </span>
      </div>
    </>
  );
}

async function createProductReducer(_: FormState, formData: FormData): Promise<FormState> {
  const result = await createProductAction(formData);
  return { status: "submitted", result };
}

async function updateProductReducer(_: FormState, formData: FormData): Promise<FormState> {
  const result = await updateProductAction(formData);
  return { status: "submitted", result };
}
