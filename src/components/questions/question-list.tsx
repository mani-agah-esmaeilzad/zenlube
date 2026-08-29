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
  PENDING: "text-amber-700",
  ANSWERED: "text-emerald-700",
  ARCHIVED: "text-text-muted",
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
      <div className="border-y border-border py-8 text-center text-sm text-text-muted">
        {emptyMessage ?? "هنوز پرسشی ثبت نشده است."}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {pending.length ? (
        <section className="space-y-3">
          <SectionHeading title="سوال‌های در انتظار پاسخ" subtitle="به‌زودی توسط تیم فنی بررسی می‌شود." />
          <div className="divide-y divide-border border-y border-border">
            {pending.map((question) => (
              <QuestionCard key={question.id} question={question} variant="pending" />
            ))}
          </div>
        </section>
      ) : null}

      {answered.length ? (
        <section className="space-y-3">
          <SectionHeading title="پرسش‌های پاسخ داده شده" subtitle="دیدگاه و پاسخ کارشناسان Oilbar" />
          <div className="divide-y divide-border border-y border-border">
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
      <h4 className="text-base font-extrabold text-text-strong">{title}</h4>
      <p className="text-xs text-text-muted">{subtitle}</p>
    </div>
  );
}

function QuestionCard({ question, variant }: { question: QuestionItem; variant: "pending" | "answered" }) {
  const createdAt = dateFormatter.format(question.createdAt);
  const answeredAt = question.answeredAt ? dateFormatter.format(question.answeredAt) : null;
  const showAnswer = Boolean(question.answer);

  return (
    <article className="py-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[11px] text-text-subtle">
          {question.authorName} • ثبت شده در {createdAt}
        </p>
        <span className={cn("text-[11px] font-extrabold", statusStyle[question.status])}>
          {statusLabel[question.status]}
        </span>
      </div>
      <p className="mt-3 break-words text-sm font-bold leading-7 text-text-strong">{question.question}</p>
      {question.linkHref && question.linkLabel ? (
        <Link href={question.linkHref} className="text-link-zen mt-2 inline-flex items-center gap-1 text-xs font-bold">
          {question.linkLabel}
          <ArrowIcon className="h-3 w-3" />
        </Link>
      ) : null}

      {showAnswer ? (
        <blockquote className="mt-4 border-r-2 border-emerald-500 bg-surface-secondary py-3 pl-3 pr-4 text-sm leading-7 text-text-body">
          <p className="text-xs font-semibold text-emerald-700">پاسخ کارشناس Oilbar</p>
          <p className="mt-2 break-words">{question.answer}</p>
          {answeredAt ? <p className="mt-2 text-[11px] text-text-subtle">تاریخ پاسخ: {answeredAt}</p> : null}
        </blockquote>
      ) : variant === "pending" ? (
        <p className="mt-4 border-r-2 border-primary-accent py-1 pr-4 text-xs leading-6 text-primary-accent-strong">
          این پرسش در صف بررسی است و حداکثر ظرف ۲۴ ساعت پاسخ داده می‌شود.
        </p>
      ) : null}
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
