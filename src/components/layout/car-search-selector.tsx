"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { CarHierarchy } from "@/lib/data";

type CarSearchSelectorProps = {
  hierarchy: CarHierarchy[];
};

export function CarSearchSelector({ hierarchy }: CarSearchSelectorProps) {
  const router = useRouter();
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [selectedCarSlug, setSelectedCarSlug] = useState<string>("");

  const models = useMemo(() => {
    if (!selectedBrand) {
      return [];
    }
    const brand = hierarchy.find((item) => item.brand === selectedBrand);
    return brand?.models ?? [];
  }, [hierarchy, selectedBrand]);

  const cars = useMemo(() => {
    if (!selectedModel) {
      return [];
    }
    return models.find((item) => item.model === selectedModel)?.options ?? [];
  }, [models, selectedModel]);

  const handleBrandChange = (value: string) => {
    setSelectedBrand(value);
    setSelectedModel("");
    setSelectedCarSlug("");
  };

  const handleModelChange = (value: string) => {
    setSelectedModel(value);
    setSelectedCarSlug("");
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (selectedCarSlug) {
      router.push(`/cars/${selectedCarSlug}`);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white p-3 text-sm text-slate-600 shadow-sm"
    >
      <label className="flex flex-1 min-w-[150px] flex-col gap-1 text-xs text-slate-500">
        برند خودرو
        <select
          value={selectedBrand}
          onChange={(event) => handleBrandChange(event.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-sky-300"
        >
          <option value="">انتخاب برند</option>
          {hierarchy.map((brand) => (
            <option key={brand.brand} value={brand.brand}>
              {brand.brand}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-1 min-w-[150px] flex-col gap-1 text-xs text-slate-500">
        مدل
        <select
          value={selectedModel}
          onChange={(event) => handleModelChange(event.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-sky-300 disabled:cursor-not-allowed disabled:opacity-40"
          disabled={!selectedBrand}
        >
          <option value="">انتخاب مدل</option>
          {models.map((model) => (
            <option key={model.model} value={model.model}>
              {model.model}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-1 min-w-[180px] flex-col gap-1 text-xs text-slate-500">
        تیپ / نسل
        <select
          value={selectedCarSlug}
          onChange={(event) => setSelectedCarSlug(event.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-sky-300 disabled:cursor-not-allowed disabled:opacity-40"
          disabled={!selectedModel}
        >
          <option value="">انتخاب نسخه</option>
          {cars.map((car) => (
            <option key={car.slug} value={car.slug}>
              {car.label}
            </option>
          ))}
        </select>
      </label>

      <button
        type="submit"
        disabled={!selectedCarSlug}
        className="w-full min-w-[140px] rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:bg-sky-400/60 disabled:text-white/70 md:w-auto"
      >
        مشاهده دفترچه
      </button>
    </form>
  );
}
