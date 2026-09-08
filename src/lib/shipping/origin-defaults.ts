export const DEFAULT_SHIPPING_ORIGIN = {
  provinceName: "البرز",
  cityName: "کرج",
  address: "کرج، عظیمیه",
} as const;

type ShippingLocationChoice = {
  code: string;
  name: string;
  parentCode?: string | null;
};

function canonicalLocationName(value: string) {
  return value
    .normalize("NFKC")
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/ۀ/g, "ه")
    .replace(/\s+/g, " ")
    .trim();
}

export function resolveDefaultShippingOrigin(input: {
  provinces: readonly ShippingLocationChoice[];
  cities: readonly ShippingLocationChoice[];
  storedProvinceCode?: string | null;
  storedCityCode?: string | null;
}) {
  const storedProvinceCode = input.storedProvinceCode?.trim() ?? "";
  const storedCityCode = input.storedCityCode?.trim() ?? "";
  if (storedProvinceCode || storedCityCode) {
    return { provinceCode: storedProvinceCode, cityCode: storedCityCode };
  }

  const province = input.provinces.find((item) => (
    canonicalLocationName(item.name) === DEFAULT_SHIPPING_ORIGIN.provinceName
  ));
  if (!province) return { provinceCode: "", cityCode: "" };

  const city = input.cities.find((item) => (
    item.parentCode === province.code
    && canonicalLocationName(item.name) === DEFAULT_SHIPPING_ORIGIN.cityName
  ));
  return {
    provinceCode: province.code,
    cityCode: city?.code ?? "",
  };
}
