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

function SelectField({ ariaLabel, disabled = false, onChange, options, placeholder, value }: SelectFieldProps) {
  return (
    <label className="relative block min-w-0">
      <select
        aria-label={ariaLabel}
        className="input-zen appearance-none pl-10 pr-4 text-sm font-semibold disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-text-subtle"
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
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-subtle"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
        viewBox="0 0 24 24"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
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

  const manufacturerCars = manufacturer ? cars.filter((car) => car.manufacturer === manufacturer) : cars;
  const models = Array.from(new Set(manufacturerCars.map((car) => car.model))).sort((left, right) =>
    left.localeCompare(right, "fa"),
  );

  const modelCars = model ? manufacturerCars.filter((car) => car.model === model) : manufacturerCars;
  const years = Array.from(new Set(modelCars.map(getYearLabel).filter(Boolean)));
  const engines = Array.from(new Set(modelCars.map((car) => car.engineType).filter(Boolean))) as string[];
  const hasSelection = Boolean(manufacturer || model || year || engine);

  const exactMatch = hasSelection
    ? modelCars.find((car) => {
        const yearLabel = getYearLabel(car);
        return (!year || yearLabel === year) && (!engine || car.engineType === engine);
      }) ?? null
    : null;

  const helperText = !cars.length
    ? "هنوز دیتای خودرو برای پیشنهاد سریع ثبت نشده است."
    : exactMatch?.viscosity
      ? `ویسکوزیته پیشنهادی: ${exactMatch.viscosity}`
      : exactMatch
        ? "خودرو پیدا شد. محصولات سازگار را ببینید."
        : "برند و مدل خودرو را انتخاب کنید تا محصول سازگار نمایش داده شود.";

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
    <div className={cn(variant === "compact" ? "border-y border-border bg-surface-secondary py-5" : "panel-zen rounded-2xl p-5")}>
      <div className={cn(variant === "compact" ? "container-zen" : "space-y-4")}>
        <div className={cn(variant === "compact" ? "mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between" : "space-y-1")}>
          <div>
            <h2 className="text-base font-extrabold text-text-strong sm:text-lg">انتخاب روغن بر اساس خودرو</h2>
            <p className="mt-1 text-sm leading-7 text-text-muted">{helperText}</p>
          </div>
        </div>

        <div className={cn(variant === "compact" ? "grid gap-3 md:grid-cols-[repeat(4,minmax(0,1fr))_auto]" : "grid gap-3")}>
          <SelectField
            ariaLabel="برند خودرو"
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
            disabled={!models.length}
            onChange={(value) => {
              setModel(value);
              setYear("");
              setEngine("");
            }}
            options={models}
            placeholder="مدل"
            value={model}
          />
          <SelectField ariaLabel="سال" disabled={!years.length} onChange={setYear} options={years} placeholder="سال" value={year} />
          <SelectField ariaLabel="نوع موتور" disabled={!engines.length} onChange={setEngine} options={engines} placeholder="نوع موتور" value={engine} />
          <button
            className="btn-primary md:min-w-[168px]"
            disabled={isPending || !cars.length}
            onClick={handleSubmit}
            type="button"
          >
            {isPending ? "در حال انتقال..." : "یافتن محصول سازگار"}
          </button>
        </div>
      </div>
    </div>
  );
}
