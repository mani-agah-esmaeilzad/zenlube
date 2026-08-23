type ProductFilterFieldsProps = {
  brands: Array<{ id: string; name: string; slug: string }>;
  categories: Array<{ id: string; name: string; slug: string }>;
  viscosities: string[];
  oilTypes: string[];
  defaults: {
    brand?: string;
    car?: string;
    category?: string;
    viscosity?: string;
    oilType?: string;
    inStock: boolean;
    maxPrice?: number;
    minPrice?: number;
    minRating?: number;
    search?: string;
    sort?: string;
  };
  includeSearch?: boolean;
};

export function ProductFilterFields({
  brands,
  categories,
  viscosities,
  oilTypes,
  defaults,
  includeSearch = true,
}: ProductFilterFieldsProps) {
  return (
    <div className="space-y-4">
      {includeSearch ? (
        <Field label="جستجو">
          <input
            autoComplete="off"
            className="input-zen mt-2"
            defaultValue={defaults.search}
            name="search"
            placeholder="نام، برند، ویسکوزیته یا کد کالا"
          />
        </Field>
      ) : null}

      <Field label="دسته‌بندی">
        <select className="input-zen mt-2" defaultValue={defaults.category ?? ""} name="category">
          <option value="">همه دسته‌ها</option>
          {categories.map((item) => (
            <option key={item.id} value={item.slug}>
              {item.name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="برند">
        <select className="input-zen mt-2" defaultValue={defaults.brand ?? ""} name="brand">
          <option value="">همه برندها</option>
          {brands.map((item) => (
            <option key={item.id} value={item.slug}>
              {item.name}
            </option>
          ))}
        </select>
      </Field>

      {viscosities.length ? (
        <Field label="ویسکوزیته">
          <select className="input-zen mt-2" defaultValue={defaults.viscosity ?? ""} name="viscosity">
            <option value="">همه گریدها</option>
            {viscosities.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </Field>
      ) : null}

      {oilTypes.length ? (
        <Field label="نوع روغن">
          <select className="input-zen mt-2" defaultValue={defaults.oilType ?? ""} name="oilType">
            <option value="">همه انواع</option>
            {oilTypes.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </Field>
      ) : null}

      <Field label="مناسب برای خودرو">
        <input className="input-zen mt-2" defaultValue={defaults.car} name="car" placeholder="اسلاگ یا مدل خودرو" />
      </Field>

      <div className="grid gap-3 min-[360px]:grid-cols-2">
        <Field label="حداقل قیمت">
          <input
            className="input-zen mt-2"
            defaultValue={defaults.minPrice}
            inputMode="numeric"
            name="minPrice"
            placeholder="مثلاً 500000"
          />
        </Field>
        <Field label="حداکثر قیمت">
          <input
            className="input-zen mt-2"
            defaultValue={defaults.maxPrice}
            inputMode="numeric"
            name="maxPrice"
            placeholder="مثلاً 5000000"
          />
        </Field>
      </div>

      <label className="flex items-center justify-between rounded-xl border border-border bg-surface-secondary px-4 py-3 text-sm font-bold text-text">
        فقط کالاهای موجود
        <input className="size-4 accent-[#D97706]" defaultChecked={defaults.inStock} name="inStock" type="checkbox" value="1" />
      </label>

      <Field label="حداقل امتیاز">
        <select className="input-zen mt-2" defaultValue={defaults.minRating ?? ""} name="minRating">
          <option value="">همه امتیازها</option>
          <option value="4">۴ ستاره و بیشتر</option>
          <option value="3">۳ ستاره و بیشتر</option>
        </select>
      </Field>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-xs font-bold text-text">
      {label}
      {children}
    </label>
  );
}
