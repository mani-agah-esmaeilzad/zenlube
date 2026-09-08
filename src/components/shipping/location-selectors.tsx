"use client";

import { useEffect, useState } from "react";

type ShippingLocationOption = {
  code: string;
  name: string;
};

type LocationSelectorsProps = {
  provinceCode?: string;
  cityCode?: string;
  defaultProvinceCode?: string | null;
  defaultCityCode?: string | null;
  defaultProvinceName?: string | null;
  defaultCityName?: string | null;
  provinceErrors?: string[];
  cityErrors?: string[];
  onProvinceChange?: (provinceCode: string) => void;
  onCityChange?: (cityCode: string) => void;
};

const requestCache = new Map<string, Promise<ShippingLocationOption[]>>();

function isLocationOption(value: unknown): value is ShippingLocationOption {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return typeof item.code === "string" && typeof item.name === "string";
}

function loadLocations(provinceCode?: string) {
  const cacheKey = provinceCode ? `cities:${provinceCode}` : "provinces";
  const cached = requestCache.get(cacheKey);
  if (cached) return cached;

  const query = provinceCode ? `?provinceCode=${encodeURIComponent(provinceCode)}` : "";
  const request = fetch(`/api/shipping/locations${query}`, {
    headers: { Accept: "application/json" },
  })
    .then(async (response) => {
      const payload = await response.json() as { success?: boolean; data?: unknown };
      if (!response.ok || payload.success !== true || !Array.isArray(payload.data)) {
        throw new Error("دریافت فهرست شهرها با خطا روبه‌رو شد.");
      }
      return payload.data.filter(isLocationOption);
    })
    .catch((error) => {
      requestCache.delete(cacheKey);
      throw error;
    });

  requestCache.set(cacheKey, request);
  return request;
}

export function LocationSelectors({
  provinceCode,
  cityCode,
  defaultProvinceCode,
  defaultCityCode,
  defaultProvinceName,
  defaultCityName,
  provinceErrors,
  cityErrors,
  onProvinceChange,
  onCityChange,
}: LocationSelectorsProps) {
  const [internalProvinceCode, setInternalProvinceCode] = useState(defaultProvinceCode ?? "");
  const [internalCityCode, setInternalCityCode] = useState(defaultCityCode ?? "");
  const [provinces, setProvinces] = useState<ShippingLocationOption[]>([]);
  const [cities, setCities] = useState<ShippingLocationOption[]>([]);
  const [provincesLoading, setProvincesLoading] = useState(true);
  const [citiesLoading, setCitiesLoading] = useState(Boolean(defaultProvinceCode));
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const selectedProvinceCode = provinceCode ?? internalProvinceCode;
  const selectedCityCode = cityCode ?? internalCityCode;

  useEffect(() => {
    let active = true;
    setProvincesLoading(true);
    setLoadError(null);

    void loadLocations()
      .then((data) => {
        if (active) setProvinces(data);
      })
      .catch(() => {
        if (active) setLoadError("فهرست استان‌ها دریافت نشد. دوباره تلاش کنید.");
      })
      .finally(() => {
        if (active) setProvincesLoading(false);
      });

    return () => {
      active = false;
    };
  }, [reloadToken]);

  useEffect(() => {
    let active = true;
    if (!selectedProvinceCode) {
      setCities([]);
      setCitiesLoading(false);
      return () => {
        active = false;
      };
    }

    setCitiesLoading(true);
    setLoadError(null);
    void loadLocations(selectedProvinceCode)
      .then((data) => {
        if (active) setCities(data);
      })
      .catch(() => {
        if (active) setLoadError("فهرست شهرها دریافت نشد. دوباره تلاش کنید.");
      })
      .finally(() => {
        if (active) setCitiesLoading(false);
      });

    return () => {
      active = false;
    };
  }, [reloadToken, selectedProvinceCode]);

  const handleProvinceChange = (nextProvinceCode: string) => {
    if (provinceCode === undefined) setInternalProvinceCode(nextProvinceCode);
    if (cityCode === undefined) setInternalCityCode("");
    onProvinceChange?.(nextProvinceCode);
    onCityChange?.("");
  };

  const handleCityChange = (nextCityCode: string) => {
    if (cityCode === undefined) setInternalCityCode(nextCityCode);
    onCityChange?.(nextCityCode);
  };

  const retry = () => {
    requestCache.delete("provinces");
    if (selectedProvinceCode) requestCache.delete(`cities:${selectedProvinceCode}`);
    setReloadToken((current) => current + 1);
  };

  return (
    <>
      <label className="text-xs font-bold text-text">
        استان
        <select
          autoComplete="address-level1"
          className="input-zen mt-2"
          name="provinceCode"
          value={selectedProvinceCode}
          onChange={(event) => handleProvinceChange(event.target.value)}
          required
          disabled={provincesLoading}
          aria-busy={provincesLoading}
        >
          <option value="">{provincesLoading ? "در حال دریافت استان‌ها..." : "استان را انتخاب کنید"}</option>
          {provinces.map((province) => (
            <option key={province.code} value={province.code}>{province.name}</option>
          ))}
        </select>
        {!defaultProvinceCode && defaultProvinceName ? (
          <span className="mt-1 block text-[11px] font-normal leading-5 text-text-muted">
            آدرس قبلی: {defaultProvinceName}؛ برای محاسبه ارسال دوباره انتخاب کنید.
          </span>
        ) : null}
        {provinceErrors?.map((error) => (
          <span key={error} className="mt-1 block text-[11px] font-bold text-[#DC2626]">{error}</span>
        ))}
      </label>

      <label className="text-xs font-bold text-text">
        شهر
        <select
          autoComplete="address-level2"
          className="input-zen mt-2"
          name="cityCode"
          value={selectedCityCode}
          onChange={(event) => handleCityChange(event.target.value)}
          required
          disabled={!selectedProvinceCode || citiesLoading}
          aria-busy={citiesLoading}
        >
          <option value="">
            {!selectedProvinceCode
              ? "ابتدا استان را انتخاب کنید"
              : citiesLoading
                ? "در حال دریافت شهرها..."
                : "شهر را انتخاب کنید"}
          </option>
          {cities.map((city) => (
            <option key={city.code} value={city.code}>{city.name}</option>
          ))}
        </select>
        {!defaultCityCode && defaultCityName ? (
          <span className="mt-1 block text-[11px] font-normal leading-5 text-text-muted">شهر قبلی: {defaultCityName}</span>
        ) : null}
        {cityErrors?.map((error) => (
          <span key={error} className="mt-1 block text-[11px] font-bold text-[#DC2626]">{error}</span>
        ))}
      </label>

      {loadError ? (
        <p className="text-[11px] leading-5 text-[#DC2626] md:col-span-2">
          {loadError}{" "}
          <button type="button" className="font-black underline underline-offset-4" onClick={retry}>تلاش دوباره</button>
        </p>
      ) : !provincesLoading && provinces.length === 0 ? (
        <p className="text-[11px] leading-5 text-text-muted md:col-span-2">
          فهرست استان‌ها هنوز آماده نیست. مدیر فروشگاه باید اطلاعات شهرهای سرویس ارسال را همگام کند.
        </p>
      ) : null}
    </>
  );
}
