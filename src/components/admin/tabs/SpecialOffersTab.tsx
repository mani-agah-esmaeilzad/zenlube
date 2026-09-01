"use client";

import Link from "next/link";
import { useActionState, useEffect, useMemo, useRef, useState } from "react";

import {
  deleteProductPromotionFormAction,
  quickUpdateProductCommerceAction,
  saveProductPromotionAction,
} from "@/actions/admin";
import type { ActionResult } from "@/actions/admin/types";
import { formatTehranLocalDateTime } from "@/lib/iran-datetime";
import { formatPrice } from "@/lib/utils";
import type { AdminSpecialOffer, SpecialOffersTabData } from "@/services/admin/types";

type FormState = { status: "idle" } | { status: "submitted"; result: ActionResult };
const initialState: FormState = { status: "idle" };

const kindLabels = {
  SALE: "فروش ویژه",
  OCTANE: "اکتان و مکمل سوخت",
  RACING_FUEL: "بنزین مسابقه‌ای",
} as const;

export function SpecialOffersTab({ data }: { data: SpecialOffersTabData }) {
  const [query, setQuery] = useState("");
  const unreadyProducts = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("fa");
    return data.products
      .filter((product) => !product.torobReady)
      .filter((product) => !normalized || `${product.name} ${product.brandName}`.toLocaleLowerCase("fa").includes(normalized));
  }, [data.products, query]);

  return (
    <div className="space-y-5">
      <section className="admin-panel overflow-hidden">
        <div className="border-b border-[#E5E7EB] px-5 py-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-black text-[#111827]">آمادگی فروش و اتصال ترب</h2>
              <p className="mt-1 text-xs leading-6 text-[#667085]">
                فقط کالای دارای قیمت، موجودی و تصویر وارد خروجی ترب می‌شود. قیمت‌ها را به ریال وارد کنید.
              </p>
            </div>
            <a
              className="text-xs font-extrabold text-[#B45309]"
              href="/api/torob/products"
              rel="noreferrer"
              target="_blank"
            >
              پیش‌نمایش خروجی ترب ←
            </a>
          </div>
        </div>

        <div className="grid grid-cols-2 divide-x divide-x-reverse divide-y border-b border-[#E5E7EB] sm:grid-cols-4 sm:divide-y-0">
          <ReadinessStat label="آماده ترب" value={data.readiness.torobReady} total={data.readiness.total} tone="success" />
          <ReadinessStat label="بدون قیمت" value={data.readiness.missingPrice} tone="warning" />
          <ReadinessStat label="ناموجود" value={data.readiness.outOfStock} tone="warning" />
          <ReadinessStat label="بدون تصویر" value={data.readiness.missingImage} tone="warning" />
        </div>

        {data.readiness.torobReady < data.readiness.total ? (
          <div className="bg-amber-50 px-5 py-3 text-xs font-bold leading-6 text-amber-900">
            سایت از نظر فنی آماده است؛ برای ارسال دوباره به ترب باید قیمت و موجودی واقعی کالاهای مدنظر را پایین همین صفحه تکمیل کنید.
          </div>
        ) : (
          <div className="bg-emerald-50 px-5 py-3 text-xs font-bold text-emerald-800">همه محصولات فعال برای خروجی ترب آماده‌اند.</div>
        )}
      </section>

      <section className="admin-panel p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-[#111827]">پیشنهادهای ویژه صفحه اصلی</h2>
            <p className="mt-1 text-xs leading-6 text-[#667085]">فروش ویژه، اکتان و بنزین مسابقه‌ای را بدون دکمه بزرگ روی کارت‌ها نمایش دهید.</p>
          </div>
          <span className="admin-chip">{data.offers.length.toLocaleString("fa-IR")} پیشنهاد</span>
        </div>

        <div className="mt-5 border-t border-[#E5E7EB] pt-5">
          <PromotionForm products={data.products} />
        </div>

        {data.offers.length ? (
          <div className="mt-6 divide-y divide-[#E5E7EB] border-y border-[#E5E7EB]">
            {data.offers.map((offer) => (
              <OfferRow key={offer.id} offer={offer} products={data.products} />
            ))}
          </div>
        ) : (
          <p className="mt-6 border-y border-dashed border-[#D0D5DD] py-6 text-center text-sm text-[#667085]">هنوز پیشنهادی ثبت نشده است.</p>
        )}
      </section>

      <section className="admin-panel p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-black text-[#111827]">تکمیل سریع قیمت و موجودی</h2>
            <p className="mt-1 text-xs leading-6 text-[#667085]">محصولات ناقص از فروشگاه عمومی مخفی می‌مانند، اما برای ویرایش اینجا در دسترس‌اند.</p>
          </div>
          <input
            className="input-zen sm:max-w-xs"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="جستجوی نام یا برند"
            type="search"
            value={query}
          />
        </div>

        <div className="mt-5 divide-y divide-[#E5E7EB] border-y border-[#E5E7EB]">
          {unreadyProducts.slice(0, 80).map((product) => (
            <CommerceRow key={product.id} product={product} />
          ))}
          {!unreadyProducts.length ? (
            <p className="py-7 text-center text-sm font-bold text-emerald-700">محصول ناقصی با این جستجو پیدا نشد.</p>
          ) : null}
        </div>
        {unreadyProducts.length > 80 ? (
          <p className="mt-3 text-xs text-[#667085]">برای سرعت پنل، ۸۰ نتیجه اول نمایش داده شده است؛ نام محصول را جستجو کنید.</p>
        ) : null}
      </section>
    </div>
  );
}

function ReadinessStat({ label, value, total, tone = "neutral" }: { label: string; value: number; total?: number; tone?: "neutral" | "success" | "warning" }) {
  const color = tone === "success" ? "text-emerald-700" : tone === "warning" ? "text-amber-700" : "text-[#111827]";
  return (
    <div className="px-4 py-4 text-center">
      <p className={`text-xl font-black ${color}`}>
        {value.toLocaleString("fa-IR")}{total != null ? <span className="text-xs text-[#98A2B3]"> / {total.toLocaleString("fa-IR")}</span> : null}
      </p>
      <p className="mt-1 text-[11px] font-bold text-[#667085]">{label}</p>
    </div>
  );
}

function PromotionForm({ products, offer }: { products: SpecialOffersTabData["products"]; offer?: AdminSpecialOffer }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState(savePromotionReducer, initialState);

  useEffect(() => {
    if (!offer && state.status === "submitted" && state.result.success) formRef.current?.reset();
  }, [offer, state]);

  return (
    <form action={action} className="grid gap-3 md:grid-cols-2 xl:grid-cols-4" ref={formRef}>
      <label className="grid gap-1 text-xs font-bold text-[#475467] xl:col-span-2">
        محصول
        <select className="input-zen" defaultValue={offer?.productId ?? ""} disabled={pending || Boolean(offer)} name="productId" required>
          <option disabled value="">انتخاب محصول</option>
          {products.map((product) => (
            <option key={product.id} value={product.id}>{product.brandName} — {product.name}</option>
          ))}
        </select>
        {offer ? <input name="productId" type="hidden" value={offer.productId} /> : null}
        <FieldErrors state={state} name="productId" />
      </label>

      <label className="grid gap-1 text-xs font-bold text-[#475467]">
        نوع پیشنهاد
        <select className="input-zen" defaultValue={offer?.kind ?? "SALE"} disabled={pending} name="kind">
          {Object.entries(kindLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </label>

      <Field defaultValue={offer?.label ?? ""} disabled={pending} label="برچسب دلخواه" name="label" placeholder="مثلاً انتخاب پیست" state={state} />
      <Field defaultValue={offer?.specialPrice ?? ""} disabled={pending} label="قیمت ویژه (ریال)" min="1" name="specialPrice" placeholder="اختیاری" state={state} type="number" />
      <Field defaultValue={formatTehranLocalDateTime(offer?.startsAt)} disabled={pending} label="شروع به وقت تهران" name="startsAt" state={state} type="datetime-local" />
      <Field defaultValue={formatTehranLocalDateTime(offer?.endsAt)} disabled={pending} label="پایان به وقت تهران" name="endsAt" state={state} type="datetime-local" />
      <Field defaultValue={offer?.sortOrder ?? 0} disabled={pending} label="ترتیب نمایش" min="0" name="sortOrder" state={state} type="number" />

      <div className="flex flex-wrap items-end justify-between gap-3 md:col-span-2 xl:col-span-4">
        <label className="inline-flex min-h-11 items-center gap-2 text-xs font-bold text-[#374151]">
          <input className="size-4 accent-[#D97706]" defaultChecked={offer?.isActive ?? true} disabled={pending} name="isActive" type="checkbox" />
          فعال و قابل نمایش
        </label>
        <div className="flex items-center gap-3">
          <ActionMessage state={state} />
          <button className="btn-primary !min-h-10 px-5 text-xs disabled:opacity-60" disabled={pending} type="submit">
            {pending ? "در حال ذخیره..." : offer ? "ذخیره تغییرات" : "افزودن پیشنهاد"}
          </button>
        </div>
      </div>
    </form>
  );
}

function OfferRow({ offer, products }: { offer: AdminSpecialOffer; products: SpecialOffersTabData["products"] }) {
  return (
    <details className="group py-4">
      <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-black text-[#111827]">{offer.product.name}</span>
            <span className="admin-chip">{kindLabels[offer.kind]}</span>
            <span className={offer.isActive ? "text-[11px] font-bold text-emerald-700" : "text-[11px] font-bold text-[#98A2B3]"}>{offer.isActive ? "فعال" : "غیرفعال"}</span>
          </div>
          <p className="mt-1 text-xs text-[#667085]">
            {offer.specialPrice ? `${formatPrice(offer.specialPrice)} ویژه از ${formatPrice(offer.product.price)}` : "بدون تغییر قیمت"}
          </p>
        </div>
        <span className="text-xs font-extrabold text-[#B45309] group-open:hidden">ویرایش</span>
      </summary>
      <div className="mt-4 border-t border-dashed border-[#D0D5DD] pt-4">
        <PromotionForm offer={offer} products={products} />
        <div className="mt-3 flex items-center justify-between gap-3">
          <Link className="text-xs font-bold text-[#B45309]" href={`/products/${offer.product.slug}`} target="_blank">مشاهده محصول</Link>
          <form action={deleteProductPromotionFormAction}>
            <input name="promotionId" type="hidden" value={offer.id} />
            <button className="min-h-10 px-3 text-xs font-bold text-red-600" type="submit">حذف پیشنهاد</button>
          </form>
        </div>
      </div>
    </details>
  );
}

function CommerceRow({ product }: { product: SpecialOffersTabData["products"][number] }) {
  const [state, action, pending] = useActionState(updateCommerceReducer, initialState);
  return (
    <form action={action} className="grid gap-3 py-4 sm:grid-cols-[minmax(0,1fr)_150px_110px_auto] sm:items-end">
      <div className="min-w-0">
        <p className="truncate text-sm font-black text-[#111827]">{product.name}</p>
        <p className="mt-1 text-[11px] text-[#667085]">{product.brandName} · {!product.imageUrl ? "بدون تصویر" : "تصویر دارد"}</p>
        <input name="productId" type="hidden" value={product.id} />
      </div>
      <Field defaultValue={product.price} disabled={pending} label="قیمت (ریال)" min="0" name="price" state={state} type="number" />
      <Field defaultValue={product.stock} disabled={pending} label="موجودی" min="0" name="stock" state={state} type="number" />
      <button className="btn-outline !min-h-10 px-4 text-xs disabled:opacity-60" disabled={pending} type="submit">{pending ? "..." : "ذخیره"}</button>
      <div className="sm:col-start-2 sm:col-span-3"><ActionMessage state={state} /></div>
    </form>
  );
}

function Field({ label, name, state, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; name: string; state: FormState }) {
  return (
    <label className="grid gap-1 text-xs font-bold text-[#475467]">
      {label}
      <input {...props} className="input-zen" name={name} />
      <FieldErrors state={state} name={name} />
    </label>
  );
}

function FieldErrors({ state, name }: { state: FormState; name: string }) {
  if (state.status !== "submitted" || state.result.success) return null;
  return state.result.errors?.[name]?.map((error) => <span className="text-[11px] text-red-600" key={error}>{error}</span>) ?? null;
}

function ActionMessage({ state }: { state: FormState }) {
  if (state.status !== "submitted") return null;
  return <span className={`text-[11px] font-bold ${state.result.success ? "text-emerald-700" : "text-red-600"}`}>{state.result.message ?? (state.result.success ? "ذخیره شد." : "ذخیره انجام نشد.")}</span>;
}

async function savePromotionReducer(_: FormState, formData: FormData): Promise<FormState> {
  return { status: "submitted", result: await saveProductPromotionAction(undefined, formData) };
}

async function updateCommerceReducer(_: FormState, formData: FormData): Promise<FormState> {
  return { status: "submitted", result: await quickUpdateProductCommerceAction(undefined, formData) };
}
