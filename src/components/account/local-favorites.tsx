"use client";

import { useEffect, useState } from "react";

export function LocalFavorites() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const keys = ["oilbar:favorites", "favorites", "wishlist"];
    for (const key of keys) {
      const raw = window.localStorage.getItem(key);
      if (!raw) continue;
      try {
        const value = JSON.parse(raw);
        if (Array.isArray(value)) {
          setCount(value.length);
          return;
        }
      } catch {
        setCount(0);
      }
    }
  }, []);

  return (
    <div className="rounded-3xl border border-[#E5E7EB] bg-white p-5">
      <p className="text-sm font-black text-[#111827]">علاقه‌مندی‌ها</p>
      <p className="mt-2 text-3xl font-black text-[#DC2626]">{count.toLocaleString("fa-IR")}</p>
      <p className="mt-2 text-xs leading-6 text-[#6B7280]">
        تا زمان اضافه شدن wishlist دیتابیسی، علاقه‌مندی‌های محلی مرورگر اینجا شمرده می‌شوند.
      </p>
    </div>
  );
}
