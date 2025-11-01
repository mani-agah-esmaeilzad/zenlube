import Link from "next/link";

import { faDateFormatter } from "@/lib/formatters";
import type { QuestionsTabData } from "@/services/admin/types";
import { answerQuestionAction, archiveQuestionAction } from "@/actions/admin";

export function QuestionsTab({ data }: { data: QuestionsTabData }) {
  const { productQuestions, carQuestions } = data;

  const pendingProductQuestions = productQuestions.filter((question) => question.status === "PENDING");
  const answeredProductQuestions = productQuestions.filter((question) => question.status === "ANSWERED");
  const pendingCarQuestions = carQuestions.filter((question) => question.status === "PENDING");
  const answeredCarQuestions = carQuestions.filter((question) => question.status === "ANSWERED");

  return (
    <div className="space-y-10">
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">پرسش‌های محصولات</h2>
            <span className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-500">
              {pendingProductQuestions.length} در انتظار پاسخ
            </span>
          </div>
          <div className="mt-5 space-y-4">
            {[...pendingProductQuestions, ...answeredProductQuestions].map((question) => {
              const isAnswered = question.status === "ANSWERED";
              return (
                <div key={question.id} className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{question.question}</p>
                      <p className="mt-2 text-[11px] text-slate-400">
                        {question.authorName} · {faDateFormatter.format(question.createdAt)}
                      </p>
                      {question.product ? (
                        <Link
                          href={`/products/${question.product.slug}`}
                          className="mt-1 inline-flex items-center gap-1 text-[11px] text-purple-300 hover:text-sky-600"
                        >
                          {question.product.brandName} · {question.product.name}
                        </Link>
                      ) : null}
                    </div>
                    <span className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-500">
                      {isAnswered ? "پاسخ داده شده" : "در انتظار"}
                    </span>
                  </div>
                  <form action={answerQuestionAction} className="space-y-3">
                    <input type="hidden" name="questionId" value={question.id} />
                    <input type="hidden" name="type" value="product" />
                    <textarea
                      name="answer"
                      placeholder="پاسخ خود را وارد کنید"
                      defaultValue={question.answer ?? ""}
                      className="h-24 rounded-3xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-900"
                    />
                    <label className="flex items-center gap-2 text-xs text-slate-500">
                      <input
                        type="checkbox"
                        name="markAnswered"
                        defaultChecked={isAnswered}
                        className="h-4 w-4 rounded border border-slate-200"
                      />
                      علامت‌گذاری به عنوان پاسخ داده شده
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        type="submit"
                        className="rounded-full bg-sky-500 px-4 py-2 text-xs font-semibold text-slate-900 transition hover:bg-sky-600"
                      >
                        ذخیره پاسخ
                      </button>
                      <form
                        action={async () => {
                          "use server";
                          await archiveQuestionAction(question.id, "product");
                        }}
                      >
                        <button
                          type="submit"
                          className="rounded-full border border-red-400/40 px-4 py-2 text-xs text-red-200 transition hover:border-red-300 hover:text-red-100"
                        >
                          بایگانی
                        </button>
                      </form>
                    </div>
                  </form>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">پرسش‌های خودروها</h2>
            <span className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-500">
              {pendingCarQuestions.length} در انتظار پاسخ
            </span>
          </div>
          <div className="mt-5 space-y-4">
            {[...pendingCarQuestions, ...answeredCarQuestions].map((question) => {
              const isAnswered = question.status === "ANSWERED";
              return (
                <div key={question.id} className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{question.question}</p>
                      <p className="mt-2 text-[11px] text-slate-400">
                        {question.authorName} · {faDateFormatter.format(question.createdAt)}
                      </p>
                      {question.car ? (
                        <Link
                          href={`/cars/${question.car.slug}`}
                          className="mt-1 inline-flex items-center gap-1 text-[11px] text-purple-300 hover:text-sky-600"
                        >
                          {question.car.manufacturer} {question.car.model}
                        </Link>
                      ) : null}
                    </div>
                    <span className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-500">
                      {isAnswered ? "پاسخ داده شده" : "در انتظار"}
                    </span>
                  </div>
                  <form action={answerQuestionAction} className="space-y-3">
                    <input type="hidden" name="questionId" value={question.id} />
                    <input type="hidden" name="type" value="car" />
                    <textarea
                      name="answer"
                      placeholder="پاسخ خود را وارد کنید"
                      defaultValue={question.answer ?? ""}
                      className="h-24 rounded-3xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-900"
                    />
                    <label className="flex items-center gap-2 text-xs text-slate-500">
                      <input
                        type="checkbox"
                        name="markAnswered"
                        defaultChecked={isAnswered}
                        className="h-4 w-4 rounded border border-slate-200"
                      />
                      علامت‌گذاری به عنوان پاسخ داده شده
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        type="submit"
                        className="rounded-full bg-sky-500 px-4 py-2 text-xs font-semibold text-slate-900 transition hover:bg-sky-600"
                      >
                        ذخیره پاسخ
                      </button>
                      <form
                        action={async () => {
                          "use server";
                          await archiveQuestionAction(question.id, "car");
                        }}
                      >
                        <button
                          type="submit"
                          className="rounded-full border border-red-400/40 px-4 py-2 text-xs text-red-200 transition hover:border-red-300 hover:text-red-100"
                        >
                          بایگانی
                        </button>
                      </form>
                    </div>
                  </form>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
