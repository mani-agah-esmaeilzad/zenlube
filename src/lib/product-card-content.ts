import type { DecimalLike } from "./pricing";

type ProductCardContentInput = {
  name: string;
  packagingSizeLit?: DecimalLike | null;
  viscosity?: string | null;
};

const persianDigits = "۰۱۲۳۴۵۶۷۸۹";
const numberFormatter = new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 0 });

export function formatProductCardPrice(amountRials: number) {
  return numberFormatter.format(Math.round(amountRials));
}

export function getProductCardContent(product: ProductCardContentInput) {
  const name = product.name.trim();
  const volumeMatch = name.match(/\s+حجم(?:\s+اسمی)?\s+([\d۰-۹٠-٩][\d۰-۹٠-٩.,٫٬]*\s*(?:میلی[‌ -]?لیتر|لیتر))\s*$/u);
  const nameWithoutVolume = volumeMatch ? name.slice(0, volumeMatch.index).trim() : name;
  const modelMatch = nameWithoutVolume.match(/^(.*?[\u0600-\u06ff])\s+([A-Za-z0-9].*)$/u);
  const title = modelMatch ? modelMatch[1] : nameWithoutVolume;
  const model = modelMatch ? modelMatch[2] : product.viscosity?.trim() || null;

  // Prefer the explicit label: decimal litre fields can round an 8 ml or 355 ml pack.
  let volume = volumeMatch?.[1].replace(/\d/g, (digit) => persianDigits[Number(digit)]) ?? null;
  const litres = Number(product.packagingSizeLit ?? 0);
  if (!volume && Number.isFinite(litres) && litres > 0) {
    volume = litres < 1
      ? `${numberFormatter.format(Math.round(litres * 1000))} میلی‌لیتر`
      : `${litres.toLocaleString("fa-IR")} لیتر`;
  }

  return { title, model, volume };
}
