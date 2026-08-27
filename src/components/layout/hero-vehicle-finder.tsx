"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";

type HeroVehicleFinderProps = {
  cars: Array<{
    id: string;
    slug: string;
    manufacturer: string;
    model: string;
    engineType: string | null;
    yearFrom: number | null;
    yearTo: number | null;
    viscosity: string | null;
  }>;
  variant?: "default" | "compact";
};

type SelectFieldProps = {
  ariaLabel: string;
  disabled?: boolean;
  label: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder: string;
  value: string;
};

function getYearLabel(car: HeroVehicleFinderProps["cars"][number]) {
  if (car.yearFrom && car.yearTo && car.yearFrom !== car.yearTo) {
    return `${car.yearFrom} تا ${car.yearTo}`;
  }

  if (car.yearFrom) return String(car.yearFrom);
  if (car.yearTo) return String(car.yearTo);

  return "";
}

function SelectField({ ariaLabel, disabled = false, label, onChange, options, placeholder, value }: SelectFieldProps) {
  return (
    <label className="block min-w-0">
      <span className="mb-1.5 block text-xs font-bold text-white/60">{label}</span>
      <span className="relative block">
        <select
          aria-label={ariaLabel}
          className="input-zen appearance-none !border-white/15 !bg-white/[0.07] pl-10 pr-4 text-sm font-semibold !text-white focus:!border-primary-accent [&>option]:bg-white [&>option]:text-text-strong disabled:cursor-not-allowed disabled:!bg-white/[0.03] disabled:!text-white/35"
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          value={value}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/55"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
          viewBox="0 0 24 24"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </span>
    </label>
  );
}

export function HeroVehicleFinder({ cars, variant = "default" }: HeroVehicleFinderProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [manufacturer, setManufacturer] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [engine, setEngine] = useState("");

  const manufacturers = Array.from(new Set(cars.map((car) => car.manufacturer))).sort((left, right) =>
    left.localeCompare(right, "fa"),
  );

  const manufacturerCars = manufacturer ? cars.filter((car) => car.manufacturer === manufacturer) : [];
  const models = Array.from(new Set(manufacturerCars.map((car) => car.model))).sort((left, right) =>
    left.localeCompare(right, "fa"),
  );

  const modelCars = model ? manufacturerCars.filter((car) => car.model === model) : [];
  const years = Array.from(new Set(modelCars.map(getYearLabel).filter(Boolean))).sort((left, right) =>
    right.localeCompare(left, "fa", { numeric: true }),
  );
  const yearCars = year ? modelCars.filter((car) => getYearLabel(car) === year) : modelCars;
  const engines = Array.from(new Set(yearCars.map((car) => car.engineType).filter(Boolean))) as string[];
  const requiresYear = years.length > 0;
  const requiresEngine = engines.length > 0;
  const canSubmit = Boolean(manufacturer && model && (!requiresYear || year) && (!requiresEngine || engine));

  const exactMatch = canSubmit
    ? modelCars.find((car) => {
        const yearLabel = getYearLabel(car);
        return (!year || yearLabel === year) && (!engine || car.engineType === engine);
      }) ?? null
    : null;

  const helperText = !cars.length
    ? "هنوز دیتای خودرو برای پیشنهاد سریع ثبت نشده است."
    : !manufacturer
      ? "از سازنده شروع کنید؛ گزینه‌های بعدی بر اساس انتخاب شما نمایش داده می‌شوند."
      : !model
        ? "حالا مدل خودرو را انتخاب کنید."
        : requiresYear && !year
          ? "بازهٔ سال ساخت خودرو را مشخص کنید."
          : requiresEngine && !engine
            ? "در گام آخر، نوع موتور را انتخاب کنید."
            : exactMatch?.viscosity
              ? `ویسکوزیته پیشنهادی: ${exactMatch.viscosity}`
              : exactMatch
                ? "خودرو پیدا شد؛ محصولات سازگار آماده نمایش هستند."
                : "اطلاعات انتخاب‌شده را بررسی کنید.";

  const currentStep = !manufacturer ? 1 : !model ? 2 : requiresYear && !year ? 3 : requiresEngine && !engine ? 4 : 4;

  const handleSubmit = () => {
    startTransition(() => {
      if (exactMatch) {
        router.push(`/cars/${exactMatch.slug}`);
        return;
      }

      const query = new URLSearchParams();
      if (manufacturer) query.set("manufacturer", manufacturer);
      if (model) query.set("model", model);
      router.push(query.size ? `/cars?${query.toString()}` : "/cars");
    });
  };

  return (
    <div className={cn(variant === "compact" ? "bg-surface-dark py-7 text-white md:py-9" : "panel-zen-dark rounded-2xl p-5")}>
      <div className={cn(variant === "compact" ? "container-zen" : "space-y-4")}>
        <div className={cn(variant === "compact" ? "mb-5 flex items-start justify-between gap-5" : "space-y-1")}>
          <div className="min-w-0">
            <h2 className="text-xl font-black text-white sm:text-2xl">خودروی شما چیست؟</h2>
            <p className="mt-1.5 max-w-2xl text-sm leading-7 text-white/60">{helperText}</p>
          </div>
          <ol aria-label="مراحل انتخاب خودرو" className="mt-2 flex shrink-0 flex-row-reverse items-center gap-1.5" dir="ltr">
            {[1, 2, 3, 4].map((step) => (
              <li
                key={step}
                aria-current={currentStep === step ? "step" : undefined}
                className={cn(
                  "h-2 rounded-full transition-all",
                  step === currentStep ? "w-6 bg-primary-accent" : step < currentStep ? "w-2 bg-white/55" : "w-2 bg-white/20",
                )}
              />
            ))}
          </ol>
        </div>

        <div className={cn(variant === "compact" ? "grid gap-3 sm:grid-cols-2 lg:grid-cols-4" : "grid gap-3")}>
          <SelectField
            ariaLabel="برند خودرو"
            label="۱. سازنده"
            onChange={(value) => {
              setManufacturer(value);
              setModel("");
              setYear("");
              setEngine("");
            }}
            options={manufacturers}
            placeholder="برند خودرو"
            value={manufacturer}
          />
          <SelectField
            ariaLabel="مدل"
            disabled={!manufacturer || !models.length}
            label="۲. مدل"
            onChange={(value) => {
              setModel(value);
              setYear("");
              setEngine("");
            }}
            options={models}
            placeholder="مدل"
            value={model}
          />
          {model && requiresYear ? (
            <SelectField
              ariaLabel="سال"
              label="۳. سال ساخت"
              onChange={(value) => {
                setYear(value);
                setEngine("");
              }}
              options={years}
              placeholder="سال ساخت"
              value={year}
            />
          ) : null}
          {model && (!requiresYear || year) && requiresEngine ? (
            <SelectField
              ariaLabel="نوع موتور"
              label={requiresYear ? "۴. موتور" : "۳. موتور"}
              onChange={setEngine}
              options={engines}
              placeholder="نوع موتور"
              value={engine}
            />
          ) : null}
          <div className="sm:col-span-2 lg:col-span-4">
          <button
            className="btn-primary w-full sm:w-auto sm:min-w-[210px]"
            disabled={isPending || !cars.length || !canSubmit}
            onClick={handleSubmit}
            type="button"
          >
            {isPending ? "در حال انتقال..." : "انتخاب خودرو"}
          </button>
          </div>
        </div>
      </div>
    </div>
  );
}
