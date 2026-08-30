"use client";

import { useActionState } from "react";

import { createProductReviewAction } from "@/actions/catalog";

const initialState = { success: false } as const;

type ReviewFormProps = {
  productId: string;
};

export function ReviewForm({ productId }: ReviewFormProps) {
  const [state, formAction] = useActionState(createProductReviewAction, initialState);

  return (
    <form action={formAction} className="border-t border-border pt-5 md:pt-6">
      <input type="hidden" name="productId" value={productId} />
      <h3 className="text-lg font-black text-text-strong">ثبت نظر و امتیاز</h3>
      <p className="mt-2 text-xs leading-6 text-text-muted">
        فقط کاربران واردشده می‌توانند نظر ثبت کنند. اگر این محصول را خریده باشید، نظر شما به‌عنوان خرید تاییدشده نمایش داده می‌شود.
      </p>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="text-xs font-bold text-text-strong">
          امتیاز
          <select name="rating" defaultValue="5" className="input-zen mt-2">
            <option value="5">۵ از ۵</option>
            <option value="4">۴ از ۵</option>
            <option value="3">۳ از ۵</option>
            <option value="2">۲ از ۵</option>
            <option value="1">۱ از ۵</option>
          </select>
          {state.errors?.rating?.map((error) => <ErrorText key={error} error={error} />)}
        </label>

        <label className="text-xs font-bold text-text-strong">
          عنوان نظر
          <input name="title" className="input-zen mt-2" placeholder="مثلاً عملکرد خوب در هوای گرم" autoComplete="off" />
          {state.errors?.title?.map((error) => <ErrorText key={error} error={error} />)}
        </label>
      </div>

      <label className="mt-4 block text-xs font-bold text-text-strong">
        متن نظر
        <textarea
          name="comment"
          rows={5}
          className="input-zen mt-2 min-h-36 resize-y"
          placeholder="تجربه واقعی‌تان از کیفیت، صدا، مصرف یا بسته‌بندی را بنویسید."
        />
        {state.errors?.comment?.map((error) => <ErrorText key={error} error={error} />)}
      </label>

      {state.message ? (
        <p
          className={`mt-4 border-r-2 py-2 pl-3 pr-4 text-xs font-bold ${
            state.success
              ? "border-emerald-500 text-emerald-700"
              : "border-red-500 text-[#B42318]"
          }`}
        >
          {state.message}
        </p>
      ) : null}

      <button type="submit" className="btn-primary mt-5 w-fit px-4">
        ثبت نظر
      </button>
    </form>
  );
}

function ErrorText({ error }: { error: string }) {
  return <span className="mt-1 block text-[11px] font-bold text-[#DC2626]">{error}</span>;
}
