"use client";

import { useActionState, useEffect, useRef } from "react";

import { saveBlogCategoryAction, saveBlogPostAction } from "@/actions/admin";
import type { ActionResult } from "@/actions/admin/types";
import type { AdminBlogCategory, AdminBlogPost, AdminContentProductOption } from "@/services/admin/types";

type FormState = { status: "idle" } | { status: "submitted"; result: ActionResult };

const initialState: FormState = { status: "idle" };

export function BlogCategoryForm({ category }: { category?: AdminBlogCategory }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(saveBlogCategoryReducer, initialState);

  useEffect(() => {
    if (!category && state.status === "submitted" && state.result.success) {
      formRef.current?.reset();
    }
  }, [category, state]);

  return (
    <form ref={formRef} action={formAction} className="rounded-2xl border border-dashed border-[#E5E7EB] p-4">
      {category ? <input type="hidden" name="id" value={category.id} /> : null}
      <p className="text-sm font-bold text-[#111827]">{category ? "ویرایش دسته مجله" : "افزودن دسته مجله"}</p>
      <div className="mt-3 grid gap-3">
        <Field name="title" placeholder="مثلاً راهنمای روغن موتور" defaultValue={category?.title} errors={readErrors(state, "title")} disabled={isPending} />
        <Field name="slug" placeholder="engine-oil-guides" defaultValue={category?.slug} errors={readErrors(state, "slug")} disabled={isPending} />
        <Textarea name="description" placeholder="توضیح کوتاه دسته" defaultValue={category?.description ?? ""} errors={readErrors(state, "description")} disabled={isPending} rows={3} />
        <Field name="sortOrder" type="number" placeholder="ترتیب نمایش" defaultValue={String(category?.sortOrder ?? 0)} errors={readErrors(state, "sortOrder")} disabled={isPending} />
        <label className="flex items-center gap-2 text-xs font-bold text-[#374151]">
          <input type="checkbox" name="isActive" defaultChecked={category?.isActive ?? true} className="size-4 accent-[#F59E0B]" disabled={isPending} />
          فعال در مجله
        </label>
        <ActionStateMessage state={state} />
        <button type="submit" disabled={isPending} className="btn-primary disabled:cursor-not-allowed disabled:opacity-60">
          {isPending ? "در حال ذخیره..." : category ? "ذخیره دسته" : "افزودن دسته"}
        </button>
      </div>
    </form>
  );
}

export function BlogPostForm({
  categories,
  post,
  products,
}: {
  categories: AdminBlogCategory[];
  post?: AdminBlogPost;
  products: AdminContentProductOption[];
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(saveBlogPostReducer, initialState);
  const faqText = post?.faqItems.map((item) => `${item.question} | ${item.answer}`).join("\n") ?? "";
  const relatedProductSet = new Set(post?.relatedProductSlugs ?? []);

  useEffect(() => {
    if (!post && state.status === "submitted" && state.result.success) {
      formRef.current?.reset();
    }
  }, [post, state]);

  return (
    <form ref={formRef} action={formAction} className="rounded-2xl border border-dashed border-[#E5E7EB] p-4">
      {post ? <input type="hidden" name="id" value={post.id} /> : null}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-[#111827]">{post ? "ویرایش مقاله" : "ایجاد مقاله مجله"}</p>
          <p className="mt-1 text-[11px] leading-5 text-[#667085]">متن مقاله فعلاً با Markdown ساده ذخیره می‌شود؛ تیترها را با ### و لیست‌ها را با - بنویسید.</p>
        </div>
        {post ? <a href={`/blog/${post.slug}`} target="_blank" className="text-xs font-extrabold text-[#B45309]">مشاهده صفحه</a> : null}
      </div>

      <div className="mt-4 grid gap-3">
        <Field name="title" placeholder="عنوان مقاله" defaultValue={post?.title} errors={readErrors(state, "title")} disabled={isPending} />
        <Field name="slug" placeholder="mg6-engine-oil-guide" defaultValue={post?.slug} errors={readErrors(state, "slug")} disabled={isPending} />
        <Textarea name="excerpt" placeholder="خلاصه کوتاه برای کارت، گوگل و ابتدای مقاله" defaultValue={post?.excerpt ?? ""} errors={readErrors(state, "excerpt")} disabled={isPending} rows={3} />
        <Textarea name="content" placeholder="متن کامل مقاله" defaultValue={post?.content ?? ""} errors={readErrors(state, "content")} disabled={isPending} rows={10} />

        <div className="grid gap-3 md:grid-cols-2">
          <label className="text-xs font-bold text-[#374151]">
            دسته مجله
            <select name="categoryId" defaultValue={post?.categoryId ?? ""} className="input-zen mt-1" disabled={isPending}>
              <option value="">بدون دسته</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.title}</option>
              ))}
            </select>
            {readErrors(state, "categoryId")?.map((error) => <ErrorText key={error} text={error} />)}
          </label>
          <label className="text-xs font-bold text-[#374151]">
            وضعیت
            <select name="status" defaultValue={post?.status ?? "DRAFT"} className="input-zen mt-1" disabled={isPending}>
              <option value="DRAFT">پیش‌نویس</option>
              <option value="PUBLISHED">منتشر شده</option>
              <option value="ARCHIVED">آرشیو</option>
            </select>
          </label>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <Field name="coverImage" placeholder="آدرس تصویر کاور" defaultValue={post?.coverImage ?? ""} errors={readErrors(state, "coverImage")} disabled={isPending} />
          <Field name="authorName" placeholder="نویسنده" defaultValue={post?.authorName ?? "تیم تحریریه Oilbar"} errors={readErrors(state, "authorName")} disabled={isPending} />
          <Field name="readMinutes" type="number" placeholder="زمان مطالعه" defaultValue={String(post?.readMinutes ?? 5)} errors={readErrors(state, "readMinutes")} disabled={isPending} />
          <Field name="publishedAt" type="datetime-local" defaultValue={formatLocalDateTime(post?.publishedAt)} errors={readErrors(state, "publishedAt")} disabled={isPending} />
          <Field name="sortOrder" type="number" placeholder="ترتیب نمایش" defaultValue={String(post?.sortOrder ?? 0)} errors={readErrors(state, "sortOrder")} disabled={isPending} />
        </div>

        <Textarea name="tags" placeholder="تگ‌ها با ویرگول یا هر خط یکی: MG، روغن موتور، 5W-30" defaultValue={post?.tags.join("، ") ?? ""} errors={readErrors(state, "tags")} disabled={isPending} rows={2} />
        <Textarea name="faqItems" placeholder="هر خط یک FAQ: سوال | جواب" defaultValue={faqText} errors={readErrors(state, "faqItems")} disabled={isPending} rows={4} />

        <label className="text-xs font-bold text-[#374151]">
          محصولات پیشنهادی داخل مقاله
          <select name="relatedProductSlugs" multiple defaultValue={[...relatedProductSet]} className="input-zen mt-1 h-44 rounded-3xl py-3" disabled={isPending}>
            {products.map((product) => (
              <option key={product.id} value={product.slug}>{product.brandName} — {product.name}</option>
            ))}
          </select>
          <span className="mt-1 block text-[11px] leading-5 text-[#98A2B3]">برای انتخاب چند محصول از Cmd/Ctrl استفاده کنید. این محصولات پایین مقاله نمایش داده می‌شوند.</span>
          {readErrors(state, "relatedProductSlugs")?.map((error) => <ErrorText key={error} text={error} />)}
        </label>

        <div className="grid gap-3 md:grid-cols-2">
          <Field name="seoTitle" placeholder="عنوان SEO اختیاری" defaultValue={post?.seoTitle ?? ""} errors={readErrors(state, "seoTitle")} disabled={isPending} />
          <Field name="seoDescription" placeholder="توضیح SEO اختیاری" defaultValue={post?.seoDescription ?? ""} errors={readErrors(state, "seoDescription")} disabled={isPending} />
        </div>

        <label className="flex items-center gap-2 text-xs font-bold text-[#374151]">
          <input type="checkbox" name="isFeatured" defaultChecked={post?.isFeatured ?? false} className="size-4 accent-[#F59E0B]" disabled={isPending} />
          مقاله شاخص برای صفحه مجله/خانه
        </label>

        <ActionStateMessage state={state} />
        <button type="submit" disabled={isPending} className="btn-primary disabled:cursor-not-allowed disabled:opacity-60">
          {isPending ? "در حال ذخیره..." : post ? "ذخیره مقاله" : "ایجاد مقاله"}
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
      {errors?.map((error) => <ErrorText key={error} text={error} />)}
    </label>
  );
}

function Textarea({
  name,
  placeholder,
  errors,
  disabled,
  defaultValue,
  rows,
}: {
  name: string;
  placeholder?: string;
  errors?: string[];
  disabled?: boolean;
  defaultValue?: string;
  rows: number;
}) {
  return (
    <label className="text-xs font-bold text-[#374151]">
      <textarea
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        className="input-zen rounded-3xl py-3"
      />
      {errors?.map((error) => <ErrorText key={error} text={error} />)}
    </label>
  );
}

function ActionStateMessage({ state }: { state: FormState }) {
  if (state.status !== "submitted") return null;
  if (state.result.success) return <p className="rounded-2xl bg-green-50 px-4 py-3 text-xs font-bold text-[#16A34A]">تغییرات با موفقیت ثبت شد.</p>;
  if (state.result.message) return <p className="rounded-2xl bg-red-50 px-4 py-3 text-xs font-bold text-[#DC2626]">{state.result.message}</p>;
  return null;
}

function ErrorText({ text }: { text: string }) {
  return <span className="mt-1 block text-[11px] text-[#DC2626]">{text}</span>;
}

function readErrors(state: FormState, field: string) {
  if (state.status !== "submitted" || state.result.success) return undefined;
  return state.result.errors?.[field];
}

function formatLocalDateTime(value?: Date | null) {
  if (!value) return "";
  const date = new Date(value);
  const offsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

async function saveBlogCategoryReducer(_: FormState, formData: FormData): Promise<FormState> {
  const result = await saveBlogCategoryAction(formData);
  return { status: "submitted", result };
}

async function saveBlogPostReducer(_: FormState, formData: FormData): Promise<FormState> {
  const result = await saveBlogPostAction(formData);
  return { status: "submitted", result };
}
