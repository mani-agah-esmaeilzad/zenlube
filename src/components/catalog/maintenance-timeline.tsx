"use client";

import { useMemo, useState } from "react";
import { cn, formatPrice } from "@/lib/utils";

type MaintenanceProduct = {
  slug: string;
  name: string;
  brandName?: string;
  price?: number;
};

export type MaintenanceTimelineTask = {
  id: string;
  title: string;
  description?: string | null;
  intervalKm?: number | null;
  intervalMonths?: number | null;
  priority: number;
  recommendedProducts?: MaintenanceProduct[];
};

type MaintenanceTimelineProps = {
  carName: string;
  tasks: MaintenanceTimelineTask[];
};

type TaskStatus = "due" | "upcoming" | "ok";

export function MaintenanceTimeline({ carName, tasks }: MaintenanceTimelineProps) {
  const [currentMileage, setCurrentMileage] = useState<number | null>(null);
  const [lastServiceMileage, setLastServiceMileage] = useState<number | null>(null);
  const [monthsSinceService, setMonthsSinceService] = useState<number | null>(null);

  const computedTasks = useMemo(() => {
    return tasks
      .map((task) => {
        const intervalKm = task.intervalKm ?? null;
        const intervalMonths = task.intervalMonths ?? null;
        const nextDueKm =
          currentMileage != null && lastServiceMileage != null && intervalKm
            ? lastServiceMileage + intervalKm
            : null;
        const kmRemaining =
          currentMileage != null && nextDueKm != null ? nextDueKm - currentMileage : null;

        const monthsRemaining =
          monthsSinceService != null && intervalMonths != null
            ? intervalMonths - monthsSinceService
            : null;

        const nextDueMonths = intervalMonths ?? null;

        let status: TaskStatus = "ok";
        if (
          (kmRemaining != null && kmRemaining <= 0) ||
          (monthsRemaining != null && monthsRemaining <= 0)
        ) {
          status = "due";
        } else if (
          (kmRemaining != null && kmRemaining <= 1000) ||
          (monthsRemaining != null && monthsRemaining <= 1)
        ) {
          status = "upcoming";
        }

        return {
          ...task,
          intervalKm,
          intervalMonths,
          nextDueKm,
          kmRemaining,
          nextDueMonths,
          monthsRemaining,
          status,
        };
      })
      .sort((a, b) => {
        if (a.status !== b.status) {
          if (a.status === "due") return -1;
          if (b.status === "due") return 1;
          if (a.status === "upcoming") return -1;
          if (b.status === "upcoming") return 1;
        }
        if (a.priority !== b.priority) {
          return a.priority - b.priority;
        }
        const aInterval = a.intervalKm ?? Number.MAX_SAFE_INTEGER;
        const bInterval = b.intervalKm ?? Number.MAX_SAFE_INTEGER;
        return aInterval - bInterval;
      });
  }, [tasks, currentMileage, lastServiceMileage, monthsSinceService]);

  const statusDescriptions: Record<TaskStatus, string> = {
    due: "نیاز به اقدام فوری",
    upcoming: "در شرف رسیدن",
    ok: "وضعیت عادی",
  };

  return (
    <div className="space-y-6 rounded-[40px] border border-white/10 bg-white/5 p-6">
      <header className="space-y-3">
        <h2 className="text-2xl font-semibold text-white">برنامه نگهداری {carName}</h2>
        <p className="text-sm leading-7 text-white/70">
          با وارد کردن کیلومتر فعلی و آخرین سرویس، موعد تقریبی هر سرویس محاسبه می‌شود. اطلاعات
          ذخیره نمی‌شود و صرفاً جهت راهنمایی فوری است.
        </p>
        <div className="grid gap-3 md:grid-cols-3">
          <label className="flex flex-col text-xs text-white/60">
            کیلومتر فعلی خودرو
            <input
              type="number"
              min={0}
              placeholder="مثال: 84500"
              onChange={(event) => {
                const value = Number(event.target.value);
                setCurrentMileage(Number.isNaN(value) ? null : value);
              }}
              className="mt-2 rounded-full border border-white/15 bg-black/40 px-4 py-2 text-sm text-white outline-none focus:border-purple-400"
            />
          </label>
          <label className="flex flex-col text-xs text-white/60">
            کیلومتر آخرین سرویس کامل
            <input
              type="number"
              min={0}
              placeholder="مثال: 78000"
              onChange={(event) => {
                const value = Number(event.target.value);
                setLastServiceMileage(Number.isNaN(value) ? null : value);
              }}
              className="mt-2 rounded-full border border-white/15 bg-black/40 px-4 py-2 text-sm text-white outline-none focus:border-purple-400"
            />
          </label>
          <label className="flex flex-col text-xs text-white/60">
            ماه‌های گذشته از آخرین سرویس
            <input
              type="number"
              min={0}
              placeholder="مثال: 4"
              onChange={(event) => {
                const value = Number(event.target.value);
                setMonthsSinceService(Number.isNaN(value) ? null : value);
              }}
              className="mt-2 rounded-full border border-white/15 bg-black/40 px-4 py-2 text-sm text-white outline-none focus:border-purple-400"
            />
          </label>
        </div>
      </header>

      <div className="space-y-4">
        {computedTasks.map((task) => (
          <article
            key={task.id}
            className={cn(
              "rounded-3xl border px-5 py-4 transition",
              task.status === "due"
                ? "border-red-400/40 bg-red-500/10"
                : task.status === "upcoming"
                ? "border-yellow-400/40 bg-yellow-500/10"
                : "border-white/10 bg-black/20",
            )}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-base font-semibold text-white">{task.title}</h3>
                  <span
                    className={cn(
                      "rounded-full border px-3 py-1 text-[11px]",
                      task.status === "due"
                        ? "border-red-400/60 text-red-100"
                        : task.status === "upcoming"
                        ? "border-yellow-400/60 text-yellow-100"
                        : "border-white/15 text-white/60",
                    )}
                  >
                    {statusDescriptions[task.status]}
                  </span>
                </div>
                {task.description ? (
                  <p className="mt-2 text-xs leading-6 text-white/70">{task.description}</p>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-2 text-[11px] text-white/60">
                <span className="rounded-full border border-white/15 px-3 py-1">
                  اولویت {task.priority}
                </span>
                <span className="rounded-full border border-white/15 px-3 py-1">
                  بازه کیلومتری: {task.intervalKm ? `${Intl.NumberFormat("fa-IR").format(task.intervalKm)} کیلومتر` : "نامشخص"}
                </span>
                <span className="rounded-full border border-white/15 px-3 py-1">
                  بازه زمانی: {task.intervalMonths ? `${task.intervalMonths} ماه` : "نامشخص"}
                </span>
              </div>
            </div>
            <div className="mt-3 grid gap-3 text-[11px] text-white/60 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
                <p className="text-white/50">برآورد کیلومتر بعدی</p>
                <p className="mt-1 text-sm text-white">
                  {task.nextDueKm != null
                    ? Intl.NumberFormat("fa-IR").format(Math.max(task.nextDueKm, 0))
                    : "با وارد کردن کیلومترها محاسبه می‌شود"}
                </p>
                {task.kmRemaining != null && (
                  <p
                    className={cn(
                      "mt-1 text-xs",
                      task.kmRemaining <= 0
                        ? "text-red-200"
                        : task.kmRemaining <= 1000
                        ? "text-yellow-200"
                        : "text-white/60",
                    )}
                  >
                    {task.kmRemaining <= 0
                      ? "از موعد سرویس عبور کرده‌اید."
                      : `${Intl.NumberFormat("fa-IR").format(task.kmRemaining)} کیلومتر تا موعد باقی مانده است.`}
                  </p>
                )}
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
                <p className="text-white/50">برآورد زمانی</p>
                <p className="mt-1 text-sm text-white">
                  {task.nextDueMonths != null
                    ? `${task.nextDueMonths} ماه`
                    : "با وارد کردن ماه‌های گذشته محاسبه می‌شود"}
                </p>
                {task.monthsRemaining != null && (
                  <p
                    className={cn(
                      "mt-1 text-xs",
                      task.monthsRemaining <= 0
                        ? "text-red-200"
                        : task.monthsRemaining <= 1
                        ? "text-yellow-200"
                        : "text-white/60",
                    )}
                  >
                    {task.monthsRemaining <= 0
                      ? "سرویس دوره‌ای از بازه زمانی عبور کرده است."
                      : `${Intl.NumberFormat("fa-IR").format(Math.max(task.monthsRemaining, 0))} ماه تا موعد باقی مانده است.`}
                  </p>
                )}
              </div>
            </div>
            {task.recommendedProducts && task.recommendedProducts.length ? (
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-white/70">
                {task.recommendedProducts.map((product) => (
                  <a
                    key={product.slug}
                    href={`/products/${product.slug}`}
                    className="inline-flex items-center gap-1 rounded-full border border-purple-400/30 bg-purple-500/10 px-3 py-1 text-purple-100 transition hover:border-purple-300/60 hover:text-purple-50"
                  >
                    {product.brandName ? `${product.brandName} · ${product.name}` : product.name}
                    {typeof product.price === "number" ? (
                      <span className="text-[10px] text-purple-200/70">
                        {formatPrice(product.price)}
                      </span>
                    ) : null}
                  </a>
                ))}
              </div>
            ) : null}
          </article>
        ))}
        {!computedTasks.length && (
          <div className="rounded-3xl border border-dashed border-white/15 bg-black/20 p-10 text-center text-sm text-white/50">
            برای این خودرو هنوز برنامه نگهداری تعریف نشده است.
          </div>
        )}
      </div>
    </div>
  );
}
