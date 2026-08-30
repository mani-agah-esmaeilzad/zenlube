"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { cn } from "@/lib/utils";

type LocalGarageCar = {
  brand: string;
  model: string;
  slug: string;
  variant: string;
};

type LocalGarageProps = {
  cars: LocalGarageCar[];
};

const STORAGE_KEY = "oilbar:garage";

export function LocalGarage({ cars }: LocalGarageProps) {
  const [savedSlugs, setSavedSlugs] = useState<string[]>([]);

  useEffect(() => {
    try {
      const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
      if (Array.isArray(parsed)) {
        setSavedSlugs(parsed.filter((item): item is string => typeof item === "string"));
      }
    } catch {
      setSavedSlugs([]);
    }
  }, []);

  const savedCars = useMemo(() => {
    const lookup = new Map(cars.map((car) => [car.slug, car] as const));
    return savedSlugs.map((slug) => lookup.get(slug)).filter(Boolean) as LocalGarageCar[];
  }, [cars, savedSlugs]);

  const toggleCar = (slug: string) => {
    setSavedSlugs((current) => {
      const next = current.includes(slug) ? current.filter((item) => item !== slug) : [slug, ...current].slice(0, 6);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  return (
    <div className="py-1">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-black text-[#111827]">گاراژ شما</p>
          <p className="mt-2 text-xs leading-6 text-[#6B7280]">
            خودروهای منتخب شما روی همین مرورگر ذخیره می‌شوند تا سریع‌تر به دفترچه و محصولات سازگار برسید.
          </p>
        </div>
        <span className="shrink-0 text-[11px] font-bold text-[#D97706]">
          {savedCars.length.toLocaleString("fa-IR")} خودرو
        </span>
      </div>

      {savedCars.length ? (
        <div className="mt-4 divide-y divide-border border-t border-border">
          {savedCars.map((car) => (
            <div key={car.slug} className="py-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-bold text-[#111827]">
                    {car.brand} {car.model}
                  </p>
                  <p className="mt-1 text-xs text-[#667085]">{car.variant}</p>
                </div>
                <div className="flex flex-wrap gap-1">
                  <Link href={`/cars/${car.slug}`} className="btn-ghost min-h-11 px-3 text-xs">
                    دفترچه خودرو
                  </Link>
                  <Link href={`/products?car=${car.slug}`} className="btn-ghost min-h-11 px-3 text-xs text-primary-accent-strong">
                    محصولات سازگار
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-xs leading-6 text-[#6B7280]">
          هنوز خودرویی در گاراژ این دستگاه ذخیره نشده است.
        </p>
      )}

      <div className="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-none sm:mx-0 sm:px-0">
        {cars.slice(0, 12).map((car) => {
          const active = savedSlugs.includes(car.slug);
          return (
            <button
              key={car.slug}
              type="button"
              onClick={() => toggleCar(car.slug)}
              className={cn(
                "min-h-11 shrink-0 border-b-2 px-3 py-2 text-xs font-bold transition",
                active
                  ? "border-[#D97706] text-[#D97706]"
                  : "border-transparent text-[#475467] hover:border-[#E7E8EE]",
              )}
            >
              {car.brand} {car.model}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex justify-end">
        <Link href="/cars" className="btn-ghost min-h-11 px-3 text-xs text-primary-accent-strong">
          مشاهده همه خودروها و دفترچه‌ها
        </Link>
      </div>
    </div>
  );
}
