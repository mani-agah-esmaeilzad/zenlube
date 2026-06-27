"use client";

import { useState, useTransition } from "react";

type QuestionFormProps = {
  type: "product" | "car";
  slug: string;
  title?: string;
};

type SubmissionState = {
  status: "idle" | "success" | "error";
  message?: string;
};

export function QuestionForm({ type, slug, title }: QuestionFormProps) {
  const [authorName, setAuthorName] = useState("");
  const [question, setQuestion] = useState("");
  const [state, setState] = useState<SubmissionState>({ status: "idle" });
  const [isPending, startTransition] = useTransition();

  const reset = () => {
    setAuthorName("");
    setQuestion("");
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setState({ status: "idle" });

    const payload = {
      type,
      slug,
      authorName: authorName.trim(),
      question: question.trim(),
    };

    if (!payload.authorName || payload.authorName.length < 2) {
      setState({ status: "error", message: "نام باید حداقل دو کاراکتر باشد." });
      return;
    }

    if (!payload.question || payload.question.length < 5) {
      setState({ status: "error", message: "سوال باید حداقل پنج کاراکتر باشد." });
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch("/api/questions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const data = (await response.json().catch(() => ({}))) as { message?: string };
          throw new Error(data.message ?? "ارسال سوال با خطا مواجه شد.");
        }

        setState({ status: "success", message: "سوال شما ثبت شد و پس از بررسی پاسخ داده می‌شود." });
        reset();
      } catch (error) {
        setState({
          status: "error",
          message: error instanceof Error ? error.message : "امکان ارسال سوال وجود ندارد.",
        });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-md">
      {title ? (
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      ) : (
        <h3 className="text-lg font-semibold text-slate-900">پرسش خود را بپرسید</h3>
      )}
      <p className="text-xs leading-6 text-slate-500">
        سوال شما برای کارشناسان ارسال می‌شود و پس از پاسخ در همین صفحه نمایش داده خواهد شد.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col text-xs font-semibold text-slate-500">
          نام شما
          <input
            value={authorName}
            onChange={(event) => setAuthorName(event.target.value)}
            placeholder="مثال: علی رضایی"
            className="mt-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 outline-none focus:border-sky-300"
          />
        </label>
        <label className="flex flex-col text-xs font-semibold text-slate-500">
          نوع سوال
          <input
            value={type === "product" ? "سوال درباره محصول" : "سوال درباره خودرو"}
            readOnly
            className="mt-2 cursor-not-allowed rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-500"
          />
        </label>
      </div>
      <label className="flex flex-col text-xs font-semibold text-slate-500">
        متن سوال
        <textarea
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          rows={4}
          placeholder="سوال خود را با جزئیات بیان کنید..."
          className="mt-2 rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-sky-300"
        />
      </label>
      {state.status === "error" && state.message ? (
        <p className="text-xs text-red-600">{state.message}</p>
      ) : null}
      {state.status === "success" && state.message ? (
        <p className="text-xs text-emerald-600">{state.message}</p>
      ) : null}
      <button
        type="submit"
        disabled={isPending}
        className="inline-flex items-center justify-center rounded-full bg-sky-500 px-6 py-2 text-sm font-semibold text-white transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "در حال ارسال..." : "ثبت سوال"}
      </button>
    </form>
  );
}
