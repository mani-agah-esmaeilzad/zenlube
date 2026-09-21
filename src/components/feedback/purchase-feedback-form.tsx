"use client";

import { useState, useTransition } from "react";

type FeedbackState = {
  status: "idle" | "success" | "error";
  message?: string;
};

export function PurchaseFeedbackForm({ token }: { token: string }) {
  const [state, setState] = useState<FeedbackState>({ status: "idle" });
  const [startedAt] = useState(() => Date.now());
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    setState({ status: "idle" });

    const payload = {
      overallRating: Number(values.get("overallRating")),
      productQualityRating: Number(values.get("productQualityRating")),
      deliveryRating: Number(values.get("deliveryRating")),
      recommend: values.get("recommend") === "yes",
      comment: String(values.get("comment") ?? "").trim(),
      website: String(values.get("website") ?? ""),
      formStartedAt: startedAt,
    };

    startTransition(async () => {
      try {
        const response = await fetch(`/api/feedback/${encodeURIComponent(token)}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const result = await response.json().catch(() => ({})) as { ok?: boolean; message?: string };
        if (!response.ok || !result.ok) throw new Error(result.message ?? "ثبت نظر انجام نشد.");
        setState({ status: "success", message: "نظر شما ثبت شد؛ ممنون که به بهترشدن اویل‌بار کمک کردید." });
        form.reset();
      } catch (error) {
        setState({ status: "error", message: error instanceof Error ? error.message : "ثبت نظر انجام نشد." });
      }
    });
  }

  if (state.status === "success") {
    return (
      <div className="border-y border-emerald-200 bg-emerald-50 px-4 py-8 text-center">
        <p className="text-lg font-extrabold text-emerald-800">بازخورد شما ثبت شد</p>
        <p className="mt-2 text-sm leading-7 text-emerald-700">{state.message}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-7">
      <RatingField name="overallRating" label="رضایت کلی شما از این خرید" />
      <RatingField name="productQualityRating" label="کیفیت و اصالت محصولات" />
      <RatingField name="deliveryRating" label="تجربه ارسال و تحویل" />

      <fieldset className="border-t border-border pt-6">
        <legend className="text-sm font-extrabold text-text-strong">آیا خرید از اویل‌بار را به دیگران پیشنهاد می‌کنید؟</legend>
        <div className="mt-3 flex flex-wrap gap-3">
          <Choice name="recommend" value="yes" label="بله، پیشنهاد می‌کنم" />
          <Choice name="recommend" value="no" label="خیر" />
        </div>
      </fieldset>

      <label className="block border-t border-border pt-6 text-sm font-extrabold text-text-strong">
        نظر یا پیشنهادی دارید؟ <span className="font-normal text-text-muted">(اختیاری)</span>
        <textarea
          name="comment"
          rows={5}
          maxLength={1500}
          className="input-zen mt-3 min-h-36 resize-y py-3"
          placeholder="تجربه خرید، کیفیت محصول یا پیشنهادی که به بهترشدن خدمات کمک می‌کند..."
        />
      </label>

      <label className="hidden" aria-hidden="true">
        وب‌سایت
        <input name="website" tabIndex={-1} autoComplete="off" />
      </label>

      {state.status === "error" && state.message ? (
        <p className="border-r-2 border-red-500 py-2 pr-4 text-xs font-bold leading-6 text-red-700">{state.message}</p>
      ) : null}

      <button type="submit" disabled={pending} className="btn-primary w-full sm:w-auto sm:px-8">
        {pending ? "در حال ثبت نظر..." : "ثبت بازخورد"}
      </button>
    </form>
  );
}

function RatingField({ name, label }: { name: string; label: string }) {
  return (
    <fieldset className="border-t border-border pt-6 first:border-t-0 first:pt-0">
      <legend className="text-sm font-extrabold text-text-strong">{label}</legend>
      <div className="mt-3 grid grid-cols-5 gap-2" dir="ltr">
        {[1, 2, 3, 4, 5].map((rating) => (
          <label key={rating} className="cursor-pointer">
            <input className="peer sr-only" type="radio" name={name} value={rating} required />
            <span className="flex min-h-12 items-center justify-center border border-border bg-white text-sm font-black text-text-muted transition peer-checked:border-primary-accent-strong peer-checked:bg-primary-accent-soft peer-checked:text-primary-accent-strong hover:border-primary-accent">
              {rating}
            </span>
          </label>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-[11px] text-text-muted"><span>خیلی کم</span><span>عالی</span></div>
    </fieldset>
  );
}

function Choice({ name, value, label }: { name: string; value: string; label: string }) {
  return (
    <label className="cursor-pointer">
      <input className="peer sr-only" type="radio" name={name} value={value} required />
      <span className="inline-flex min-h-11 items-center border border-border bg-white px-4 text-xs font-bold text-text-muted transition peer-checked:border-primary-accent-strong peer-checked:bg-primary-accent-soft peer-checked:text-primary-accent-strong">
        {label}
      </span>
    </label>
  );
}
