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
  PENDING: "chip-zen-warning",
  ANSWERED: "chip-zen-success",
  ARCHIVED: "chip-zen-muted",
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
      <div className="panel-zen-muted rounded-[28px] border-dashed p-8 text-center text-sm text-text-muted">
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
    <article className="panel-zen rounded-[28px] p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h5 className="text-sm font-bold leading-7 text-text-strong">{question.question}</h5>
          <p className="mt-1 text-[11px] text-text-subtle">
            {question.authorName} • ثبت شده در {createdAt}
          </p>
        </div>
        <span className={cn("inline-flex items-center gap-1", statusStyle[question.status])}>
          {statusLabel[question.status]}
        </span>
      </div>
      {question.linkHref && question.linkLabel ? (
        <Link href={question.linkHref} className="text-link-zen mt-2 inline-flex items-center gap-1 text-xs font-bold">
          {question.linkLabel}
          <ArrowIcon className="h-3 w-3" />
        </Link>
      ) : null}

      <div className="panel-zen-muted mt-4 grid gap-4 rounded-[22px] border-dashed p-4 text-sm leading-7 text-text-body">
        <div className="space-y-2">
          <p className="text-xs font-bold text-text-subtle">متن پرسش</p>
          <p className="break-words">{question.question}</p>
        </div>
        {showAnswer ? (
          <div className="panel-zen rounded-[20px] p-4">
            <p className="text-xs font-semibold text-emerald-700">پاسخ کارشناس Oilbar</p>
            <p className="mt-2 break-words text-text-body">{question.answer}</p>
            {answeredAt ? <p className="mt-2 text-[11px] text-text-subtle">تاریخ پاسخ: {answeredAt}</p> : null}
          </div>
        ) : variant === "pending" ? (
          <div className="panel-zen-tint rounded-[20px] p-4 text-xs text-primary-accent-strong">
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
