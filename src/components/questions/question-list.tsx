import type { SVGProps } from "react";
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

const statusStyle: Record<QuestionItem["status"], string> = {
  PENDING: "border-amber-200 bg-amber-50 text-amber-700",
  ANSWERED: "border-emerald-200 bg-emerald-50 text-emerald-700",
  ARCHIVED: "border-slate-200 bg-slate-50 text-slate-500",
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
      <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/60 p-8 text-center text-sm text-slate-500">
        {emptyMessage ?? "هنوز پرسشی ثبت نشده است."}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {pending.length ? (
        <section className="space-y-3">
          <SectionHeading title="سوال‌های در انتظار پاسخ" subtitle="به‌زودی توسط تیم فنی بررسی می‌شود." />
          <div className="space-y-4">
            {pending.map((question) => (
              <QuestionCard key={question.id} question={question} variant="pending" />
            ))}
          </div>
        </section>
      ) : null}

      {answered.length ? (
        <section className="space-y-3">
          <SectionHeading title="پرسش‌های پاسخ داده شده" subtitle="دیدگاه و پاسخ کارشناسان Oilbar" />
          <div className="space-y-4">
            {answered.map((question) => (
              <QuestionCard key={question.id} question={question} variant="answered" />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function SectionHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex flex-col gap-1">
      <h4 className="text-base font-semibold text-slate-900">{title}</h4>
      <p className="text-xs text-slate-500">{subtitle}</p>
    </div>
  );
}

function QuestionCard({ question, variant }: { question: QuestionItem; variant: "pending" | "answered" }) {
  const createdAt = dateFormatter.format(question.createdAt);
  const answeredAt = question.answeredAt ? dateFormatter.format(question.answeredAt) : null;
  const showAnswer = Boolean(question.answer);

  return (
    <article className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-lg shadow-slate-900/5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h5 className="text-sm font-semibold text-slate-900">{question.question}</h5>
          <p className="mt-1 text-[11px] text-slate-500">
            {question.authorName} • ثبت شده در {createdAt}
          </p>
        </div>
        <span className={cn("inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[11px] font-semibold", statusStyle[question.status])}>
          {statusLabel[question.status]}
        </span>
      </div>
      {question.linkHref && question.linkLabel ? (
        <Link href={question.linkHref} className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-sky-600 hover:text-sky-800">
          {question.linkLabel}
          <ArrowIcon className="h-3 w-3" />
        </Link>
      ) : null}

      <div className="mt-4 grid gap-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 p-4 text-sm leading-7 text-slate-700">
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-500">متن پرسش</p>
          <p>{question.question}</p>
        </div>
        {showAnswer ? (
          <div className="rounded-2xl border border-emerald-100 bg-white/80 p-4">
            <p className="text-xs font-semibold text-emerald-700">پاسخ کارشناس Oilbar</p>
            <p className="mt-2 text-slate-700">{question.answer}</p>
            {answeredAt ? <p className="mt-2 text-[11px] text-slate-400">تاریخ پاسخ: {answeredAt}</p> : null}
          </div>
        ) : variant === "pending" ? (
          <div className="rounded-2xl border border-amber-100 bg-white/80 p-4 text-xs text-amber-700">
            این پرسش در صف بررسی است و حداکثر ظرف ۲۴ ساعت پاسخ داده می‌شود.
          </div>
        ) : null}
      </div>
    </article>
  );
}

function ArrowIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M5 10h10" />
      <path d="M10 5l5 5-5 5" />
    </svg>
  );
}
