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
    <form onSubmit={handleSubmit} className="panel-zen space-y-4 rounded-[28px] p-5 sm:p-6">
      {title ? (
        <h3 className="text-lg font-extrabold text-text-strong">{title}</h3>
      ) : (
        <h3 className="text-lg font-extrabold text-text-strong">پرسش خود را بپرسید</h3>
      )}
      <p className="text-xs leading-6 text-text-muted">
        سوال شما برای کارشناسان ارسال می‌شود و پس از پاسخ در همین صفحه نمایش داده خواهد شد.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col text-xs font-bold text-text-strong">
          نام شما
          <input
            value={authorName}
            onChange={(event) => setAuthorName(event.target.value)}
            placeholder="مثال: علی رضایی"
            autoComplete="name"
            className="input-zen mt-2"
          />
        </label>
        <label className="flex flex-col text-xs font-bold text-text-strong">
          نوع سوال
          <input
            value={type === "product" ? "سوال درباره محصول" : "سوال درباره خودرو"}
            readOnly
            className="input-zen mt-2 cursor-not-allowed bg-surface-muted text-text-subtle"
          />
        </label>
      </div>
      <label className="flex flex-col text-xs font-bold text-text-strong">
        متن سوال
        <textarea
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          rows={4}
          placeholder="سوال خود را با جزئیات بیان کنید..."
          className="input-zen mt-2 min-h-32 resize-y rounded-[18px] py-3"
        />
      </label>
      {state.status === "error" && state.message ? (
        <p className="rounded-xl border border-red-200 bg-[linear-gradient(180deg,#FFF6F7_0%,#FEF3F2_100%)] px-3 py-2 text-xs font-bold text-[#DC2626]">{state.message}</p>
      ) : null}
      {state.status === "success" && state.message ? (
        <p className="rounded-xl border border-emerald-200 bg-[linear-gradient(180deg,#F4FFF7_0%,#ECFDF3_100%)] px-3 py-2 text-xs font-bold text-[#16A34A]">{state.message}</p>
      ) : null}
      <button type="submit" disabled={isPending} className="btn-primary w-full sm:w-auto">
        {isPending ? "در حال ارسال..." : "ثبت سوال"}
      </button>
    </form>
  );
}
