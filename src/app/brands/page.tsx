import { BrandCard } from "@/components/catalog/brand-card";
import { getBrandsWithProductCount } from "@/lib/data";

export default async function BrandsPage() {
  const brands = await getBrandsWithProductCount();

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 space-y-10">
      <header className="space-y-3 text-slate-700">
        <h1 className="text-3xl font-semibold text-slate-900">برندهای همکاری شده با ZenLube</h1>
        <p className="text-sm leading-7 text-slate-600">
          مجموعه‌ای از معتبرترین برندهای جهانی روغن موتور با امکان فیلتر و مشاهده سریع محصولات مرتبط.
        </p>
      </header>
      <div className="grid gap-6 sm:grid-cols-2">
        {brands.map((brand) => (
          <BrandCard key={brand.id} brand={brand} />
        ))}
      </div>
    </div>
  );
}
