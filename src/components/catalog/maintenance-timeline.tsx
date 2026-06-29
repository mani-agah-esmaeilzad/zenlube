"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
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

const statusLabels: Record<TaskStatus, string> = {
  due: "نیاز به اقدام فوری",
  upcoming: "در آستانه سرویس",
  ok: "وضعیت عادی",
};

export function MaintenanceTimeline({ carName, tasks }: MaintenanceTimelineProps) {
  const [currentMileage, setCurrentMileage] = useState<number | null>(null);
  const [lastServiceMileage, setLastServiceMileage] = useState<number | null>(null);
  const [monthsSinceService, setMonthsSinceService] = useState<number | null>(null);

  const computedTasks = useMemo(() => {
    return tasks
      .map((task) => {
        const intervalKm = task.intervalKm ?? null;
        const intervalMonths = task.intervalMonths ?? null;
        const nextDueKm = currentMileage != null && lastServiceMileage != null && intervalKm ? lastServiceMileage + intervalKm : null;
        const kmRemaining = currentMileage != null && nextDueKm != null ? nextDueKm - currentMileage : null;
        const monthsRemaining = monthsSinceService != null && intervalMonths != null ? intervalMonths - monthsSinceService : null;

        let status: TaskStatus = "ok";
        if ((kmRemaining != null && kmRemaining <= 0) || (monthsRemaining != null && monthsRemaining <= 0)) status = "due";
        else if ((kmRemaining != null && kmRemaining <= 1000) || (monthsRemaining != null && monthsRemaining <= 1)) status = "upcoming";

        return { ...task, intervalKm, intervalMonths, nextDueKm, kmRemaining, monthsRemaining, status };
      })
      .sort((a, b) => {
        if (a.status !== b.status) {
          if (a.status === "due") return -1;
          if (b.status === "due") return 1;
          if (a.status === "upcoming") return -1;
          if (b.status === "upcoming") return 1;
        }
        if (a.priority !== b.priority) return a.priority - b.priority;
        return (a.intervalKm ?? Number.MAX_SAFE_INTEGER) - (b.intervalKm ?? Number.MAX_SAFE_INTEGER);
      });
  }, [tasks, currentMileage, lastServiceMileage, monthsSinceService]);

  return (
    <section className="rounded-3xl border border-[#E5E7EB] bg-white p-5 md:p-6">
      <header>
        <h2 className="section-title">برنامه نگهداری پیشنهادی {carName}</h2>
        <p className="section-subtitle">
          با وارد کردن کیلومتر فعلی و آخرین سرویس، موعد تقریبی سرویس‌ها محاسبه می‌شود. اطلاعات ذخیره نمی‌شود و فقط برای راهنمایی سریع است.
        </p>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <MileageInput label="کیلومتر فعلی خودرو" placeholder="مثال: 84500" onValue={setCurrentMileage} />
          <MileageInput label="کیلومتر آخرین سرویس کامل" placeholder="مثال: 78000" onValue={setLastServiceMileage} />
          <MileageInput label="ماه‌های گذشته از آخرین سرویس" placeholder="مثال: 4" onValue={setMonthsSinceService} />
        </div>
      </header>

      <div className="mt-6 space-y-4">
        {computedTasks.map((task) => (
          <article
            key={task.id}
            className={cn(
              "rounded-2xl border p-4 transition",
              task.status === "due"
                ? "border-[#FDE7B0] bg-[#FFF8E8]"
                : task.status === "upcoming"
                ? "border-amber-200 bg-amber-50"
                : "border-[#E5E7EB] bg-[#F7F7F8]",
            )}
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-extrabold text-[#111827]">{task.title}</h3>
                  <span className={cn("rounded-full px-3 py-1 text-[11px] font-bold", task.status === "due" ? "bg-[#FFF1F3] text-[#DC2626]" : task.status === "upcoming" ? "bg-[#FFF8E8] text-[#D97706]" : "bg-green-50 text-[#16A34A]")}>
                    {statusLabels[task.status]}
                  </span>
                </div>
                {task.description && <p className="mt-2 text-sm leading-7 text-[#6B7280]">{task.description}</p>}
              </div>
              <div className="flex flex-wrap gap-2 text-[11px] font-medium text-[#6B7280]">
                <span className="rounded-full border border-[#E5E7EB] bg-white px-3 py-1">اولویت {task.priority.toLocaleString("fa-IR")}</span>
                <span className="rounded-full border border-[#E5E7EB] bg-white px-3 py-1">
                  {task.intervalKm ? `هر ${task.intervalKm.toLocaleString("fa-IR")} کیلومتر` : "کیلومتر نامشخص"}
                </span>
                <span className="rounded-full border border-[#E5E7EB] bg-white px-3 py-1">
                  {task.intervalMonths ? `هر ${task.intervalMonths.toLocaleString("fa-IR")} ماه` : "زمان نامشخص"}
                </span>
              </div>
            </div>

            <div className="mt-4 grid gap-3 text-xs md:grid-cols-2">
              <EstimateCard title="برآورد کیلومتر بعدی" value={task.nextDueKm != null ? Math.max(task.nextDueKm, 0).toLocaleString("fa-IR") : "با ورود کیلومترها محاسبه می‌شود"} />
              <EstimateCard title="وضعیت زمانی" value={task.monthsRemaining != null ? (task.monthsRemaining <= 0 ? "موعد سرویس رسیده است" : `${Math.max(task.monthsRemaining, 0).toLocaleString("fa-IR")} ماه باقی مانده`) : "با ورود ماه‌ها محاسبه می‌شود"} />
            </div>

            {task.recommendedProducts?.length ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {task.recommendedProducts.map((product) => (
                  <Link key={product.slug} href={`/products/${product.slug}`} className="rounded-full border border-[#FDE7B0] bg-white px-3 py-1.5 text-xs font-bold text-[#D97706] hover:bg-[#FFF8E8]">
                    {product.brandName ? `${product.brandName} - ${product.name}` : product.name}
                    {typeof product.price === "number" ? <span className="mr-2 font-medium text-[#6B7280]">{formatPrice(product.price)}</span> : null}
                  </Link>
                ))}
              </div>
            ) : null}
          </article>
        ))}

        {!computedTasks.length && (
          <div className="rounded-2xl border border-dashed border-[#E5E7EB] p-8 text-center text-sm text-[#6B7280]">
            برای این خودرو هنوز برنامه نگهداری تعریف نشده است.
          </div>
        )}
      </div>
    </section>
  );
}

function MileageInput({ label, placeholder, onValue }: { label: string; placeholder: string; onValue: (value: number | null) => void }) {
  return (
    <label className="text-xs font-bold text-[#374151]">
      {label}
      <input
        type="number"
        min={0}
        placeholder={placeholder}
        onChange={(event) => {
          const value = Number(event.target.value);
          onValue(Number.isNaN(value) ? null : value);
        }}
        className="input-zen mt-2"
      />
    </label>
  );
}

function EstimateCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white p-3">
      <p className="text-[#6B7280]">{title}</p>
      <p className="mt-1 font-bold text-[#111827]">{value}</p>
    </div>
  );
}
