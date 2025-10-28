import Link from "next/link";
import { cn } from "@/lib/utils";

export type QuestionItem = {
  id: string;
  authorName: string;
  question: string;
  answer?: string | null;
  status: "PENDING" | "ANSWERED" | "ARCHIVED";
  createdAt: Date;
  answeredAt?: Date | null;
  linkHref?: string;
  linkLabel?: string;
};

type QuestionListProps = {
  items: QuestionItem[];
  emptyMessage?: string;
};

const statusLabel: Record<QuestionItem["status"], string> = {
  PENDING: "در انتظار پاسخ",
  ANSWERED: "پاسخ داده شده",
  ARCHIVED: "بایگانی شده",
};

const dateFormatter = new Intl.DateTimeFormat("fa-IR", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function QuestionList({ items, emptyMessage }: QuestionListProps) {
  const pending = items.filter((item) => item.status === "PENDING");
  const answered = items.filter((item) => item.status === "ANSWERED");

  if (items.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-white/15 bg-black/20 p-8 text-center text-sm text-white/50">
        {emptyMessage ?? "هنوز پرسشی ثبت نشده است."}
      </div>
    );
  }

  const renderQuestion = (question: QuestionItem) => {
    const createdAt = dateFormatter.format(question.createdAt);
    return (
      <article key={question.id} className="space-y-3 rounded-3xl border border-white/10 bg-black/30 p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-white">{question.question}</p>
            <p className="mt-1 text-[11px] text-white/50">
              {question.authorName} · {createdAt}
            </p>
            {question.linkHref && question.linkLabel ? (
              <Link
                href={question.linkHref}
                className="mt-1 inline-flex items-center gap-1 text-[11px] text-purple-300 hover:text-purple-100"
              >
                {question.linkLabel}
              </Link>
            ) : null}
          </div>
          <span
            className={cn(
              "rounded-full border px-3 py-1 text-[11px]",
              question.status === "ANSWERED"
                ? "border-emerald-400/40 text-emerald-200"
                : question.status === "PENDING"
                ? "border-yellow-400/40 text-yellow-200"
                : "border-white/20 text-white/50",
            )}
          >
            {statusLabel[question.status]}
          </span>
        </div>
        {question.answer ? (
          <div className="rounded-2xl border border-white/10 bg-black/40 p-4 text-sm leading-7 text-white/80">
            {question.answer}
            {question.answeredAt ? (
              <p className="mt-2 text-[11px] text-white/40">
                پاسخ در تاریخ {dateFormatter.format(question.answeredAt)} ثبت شده است.
              </p>
            ) : null}
          </div>
        ) : (
          <p className="text-xs text-white/50">
            هنوز پاسخی برای این سوال ثبت نشده است. کارشناسان در حال بررسی هستند.
          </p>
        )}
      </article>
    );
  };

  return (
    <div className="space-y-6">
      {pending.length ? (
        <section className="space-y-3">
          <h4 className="text-sm font-semibold text-white">سوال‌های در انتظار پاسخ</h4>
          <div className="space-y-3">
            {pending.map(renderQuestion)}
          </div>
        </section>
      ) : null}
      {answered.length ? (
        <section className="space-y-3">
          <h4 className="text-sm font-semibold text-white">سوال‌های پاسخ داده شده</h4>
          <div className="space-y-3">
            {answered.map(renderQuestion)}
          </div>
        </section>
      ) : null}
    </div>
  );
}
