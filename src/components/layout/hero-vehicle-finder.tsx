"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

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
    <label className="relative block">
      <select
        aria-label={ariaLabel}
        className="input-zen h-14 appearance-none rounded-2xl border-[#E5E7EB] bg-white pl-11 pr-4 text-sm font-semibold text-[#374151] disabled:cursor-not-allowed disabled:bg-[#F9FAFB] disabled:text-[#98A2B3]"
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
        className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#667085]"
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

export function HeroVehicleFinder({ cars }: HeroVehicleFinderProps) {
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

  const exactMatch =
    hasSelection
      ? modelCars.find((car) => {
          const yearLabel = getYearLabel(car);

          return (!year || yearLabel === year) && (!engine || car.engineType === engine);
        }) ?? null
      : null;

  const helperText = !cars.length
    ? "هنوز دیتای خودرو برای پیشنهاد سریع ثبت نشده است."
    : exactMatch?.viscosity
      ? `ویسکوزیته پیشنهادی برای این خودرو: ${exactMatch.viscosity}`
      : exactMatch
        ? "خودرو پیدا شد. برای دیدن محصولات سازگار ادامه بده."
        : "تا روغن و فیلتر سازگار را پیشنهاد کنیم.";

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
    <div className="rounded-[30px] border border-[#ECEEF2] bg-white p-5 shadow-[0_22px_60px_rgba(17,24,39,0.12)] md:p-6">
      <div className="space-y-2">
        <h2 className="text-[1.55rem] font-extrabold tracking-[-0.02em] text-[#171B23]">خودروت را انتخاب کن</h2>
        <p className="text-sm leading-7 text-[#667085]">{helperText}</p>
      </div>

      <div className="mt-5 grid gap-3">
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
        <SelectField
          ariaLabel="سال"
          disabled={!years.length}
          onChange={setYear}
          options={years}
          placeholder="سال"
          value={year}
        />
        <SelectField
          ariaLabel="نوع موتور"
          disabled={!engines.length}
          onChange={setEngine}
          options={engines}
          placeholder="نوع موتور"
          value={engine}
        />
      </div>

      <button
        className="btn-primary mt-4 flex h-14 w-full items-center justify-center rounded-2xl text-base"
        disabled={isPending || !cars.length}
        onClick={handleSubmit}
        type="button"
      >
        {isPending ? "در حال انتقال..." : "یافتن محصولات سازگار"}
      </button>
    </div>
  );
}
