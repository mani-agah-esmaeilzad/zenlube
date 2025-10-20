import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import {
  createBrandAction,
  createCarAction,
  createCategoryAction,
  createProductAction,
  deleteProductFormAction,
} from "@/actions/admin";
import { authOptions } from "@/lib/auth.config";
import prisma from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (session?.user?.role !== "ADMIN") {
    redirect("/sign-in?callbackUrl=/admin");
  }

  const [categories, brands, cars, products] = await Promise.all([
    prisma.category.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.brand.findMany({ orderBy: { name: "asc" } }),
    prisma.car.findMany({ orderBy: { manufacturer: "asc" } }),
    prisma.product.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        brand: true,
        category: true,
        carMappings: {
          include: { car: true },
        },
      },
    }),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 space-y-14">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold text-white">پنل مدیریت ZenLube</h1>
        <p className="text-sm leading-7 text-white/70">
          محصولات جدید ثبت کنید، دسته‌بندی و برندها را مدیریت کنید و روغن مناسب هر خودرو را مشخص نمایید. تمامی تغییرات به صورت آنی در سایت اعمال می‌شود.
        </p>
        <div className="flex flex-wrap gap-4 text-xs text-white/60">
          <span className="rounded-full border border-white/15 px-4 py-2">{products.length} محصول فعال</span>
          <span className="rounded-full border border-white/15 px-4 py-2">{brands.length} برند</span>
          <span className="rounded-full border border-white/15 px-4 py-2">{categories.length} دسته‌بندی</span>
          <span className="rounded-full border border-white/15 px-4 py-2">{cars.length} خودرو ثبت‌شده</span>
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-semibold text-white">افزودن دسته‌بندی</h2>
          <form action={createCategoryAction} className="mt-6 space-y-4">
            <input name="name" placeholder="نام دسته‌بندی" className="w-full rounded-full border border-white/15 bg-black/40 px-4 py-3 text-sm text-white" />
            <input name="slug" placeholder="اسلاگ (مثال: full-synthetic)" className="w-full rounded-full border border-white/15 bg-black/40 px-4 py-3 text-sm text-white" />
            <textarea name="description" placeholder="توضیح کوتاه" className="h-24 w-full rounded-3xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white" />
            <button type="submit" className="rounded-full bg-purple-500 px-6 py-2 text-sm font-semibold text-white hover:bg-purple-400">
              ذخیره دسته‌بندی
            </button>
          </form>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-semibold text-white">افزودن برند</h2>
          <form action={createBrandAction} className="mt-6 space-y-4">
            <input name="name" placeholder="نام برند" className="w-full rounded-full border border-white/15 bg-black/40 px-4 py-3 text-sm text-white" />
            <input name="slug" placeholder="اسلاگ (مثال: mobil-1)" className="w-full rounded-full border border-white/15 bg-black/40 px-4 py-3 text-sm text-white" />
            <input name="website" placeholder="وب‌سایت رسمی (اختیاری)" className="w-full rounded-full border border-white/15 bg-black/40 px-4 py-3 text-sm text-white" />
            <textarea name="description" placeholder="توضیح کوتاه" className="h-24 w-full rounded-3xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white" />
            <button type="submit" className="rounded-full bg-purple-500 px-6 py-2 text-sm font-semibold text-white hover:bg-purple-400">
              ذخیره برند
            </button>
          </form>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-xl font-semibold text-white">ثبت خودرو</h2>
        <form action={createCarAction} className="mt-6 grid gap-4 sm:grid-cols-2">
          <input name="slug" placeholder="اسلاگ خودرو (مثال: bmw-3-series-f30-320i)" className="sm:col-span-2 rounded-full border border-white/15 bg-black/40 px-4 py-3 text-sm text-white" />
          <input name="manufacturer" placeholder="سازنده" className="rounded-full border border-white/15 bg-black/40 px-4 py-3 text-sm text-white" />
          <input name="model" placeholder="مدل" className="rounded-full border border-white/15 bg-black/40 px-4 py-3 text-sm text-white" />
          <input name="generation" placeholder="تریم / نسل" className="rounded-full border border-white/15 bg-black/40 px-4 py-3 text-sm text-white" />
          <input name="engineType" placeholder="نوع موتور" className="rounded-full border border-white/15 bg-black/40 px-4 py-3 text-sm text-white" />
          <input name="engineCode" placeholder="کد موتور" className="rounded-full border border-white/15 bg-black/40 px-4 py-3 text-sm text-white" />
          <input name="viscosity" placeholder="ویسکوزیته پیشنهادی" className="rounded-full border border-white/15 bg-black/40 px-4 py-3 text-sm text-white" />
          <input name="oilCapacityLit" placeholder="ظرفیت روغن (لیتر)" className="rounded-full border border-white/15 bg-black/40 px-4 py-3 text-sm text-white" />
          <input name="yearFrom" placeholder="سال شروع تولید" className="rounded-full border border-white/15 bg-black/40 px-4 py-3 text-sm text-white" />
          <input name="yearTo" placeholder="سال پایان تولید" className="rounded-full border border-white/15 bg-black/40 px-4 py-3 text-sm text-white" />
          <textarea name="specification" placeholder="استاندارد یا توضیح تکمیلی" className="sm:col-span-2 h-24 rounded-3xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white" />
          <button type="submit" className="sm:col-span-2 rounded-full bg-purple-500 px-6 py-2 text-sm font-semibold text-white hover:bg-purple-400">
            ذخیره خودرو
          </button>
        </form>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-xl font-semibold text-white">افزودن محصول</h2>
        <p className="mt-2 text-xs text-white/60">
          پس از ثبت محصول، خودروهای سازگار را از لیست زیر انتخاب کنید تا در صفحه خودروها به عنوان پیشنهاد نمایش داده شود.
        </p>
        <form action={createProductAction} className="mt-6 grid gap-4 sm:grid-cols-2">
          <input name="name" placeholder="نام محصول" className="sm:col-span-2 rounded-full border border-white/15 bg-black/40 px-4 py-3 text-sm text-white" />
          <input name="slug" placeholder="اسلاگ" className="rounded-full border border-white/15 bg-black/40 px-4 py-3 text-sm text-white" />
          <input name="sku" placeholder="کد محصول" className="rounded-full border border-white/15 bg-black/40 px-4 py-3 text-sm text-white" />
          <input name="price" placeholder="قیمت (ریال)" className="rounded-full border border-white/15 bg-black/40 px-4 py-3 text-sm text-white" />
          <input name="stock" placeholder="موجودی" className="rounded-full border border-white/15 bg-black/40 px-4 py-3 text-sm text-white" />
          <input name="viscosity" placeholder="ویسکوزیته" className="rounded-full border border-white/15 bg-black/40 px-4 py-3 text-sm text-white" />
          <input name="oilType" placeholder="نوع روغن" className="rounded-full border border-white/15 bg-black/40 px-4 py-3 text-sm text-white" />
          <input name="imageUrl" placeholder="آدرس تصویر" className="sm:col-span-2 rounded-full border border-white/15 bg-black/40 px-4 py-3 text-sm text-white" />
          <div>
            <label className="text-xs text-white/60">دسته‌بندی</label>
            <select name="categoryId" className="mt-2 w-full rounded-full border border-white/15 bg-black/40 px-4 py-3 text-sm text-white">
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-white/60">برند</label>
            <select name="brandId" className="mt-2 w-full rounded-full border border-white/15 bg-black/40 px-4 py-3 text-sm text-white">
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs text-white/60">خودروهای سازگار (Ctrl یا Cmd برای انتخاب چندگانه)</label>
            <select name="carIds" multiple className="mt-2 h-40 w-full rounded-3xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white">
              {cars.map((car) => (
                <option key={car.id} value={car.id}>
                  {car.manufacturer} {car.model} {car.generation ?? ""}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input id="isFeatured" name="isFeatured" type="checkbox" className="h-5 w-5 rounded border border-white/15 bg-black/40" />
            <label htmlFor="isFeatured" className="text-xs text-white/60">نمایش در محصولات ویژه</label>
          </div>
          <textarea name="description" placeholder="توضیحات" className="sm:col-span-2 h-28 rounded-3xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white" />
          <button type="submit" className="sm:col-span-2 rounded-full bg-purple-500 px-6 py-2 text-sm font-semibold text-white hover:bg-purple-400">
            ذخیره محصول
          </button>
        </form>
      </section>

      <section className="space-y-6">
        <h2 className="text-xl font-semibold text-white">مدیریت محصولات</h2>
        <div className="overflow-hidden rounded-3xl border border-white/10">
          <table className="min-w-full divide-y divide-white/10 text-sm text-white/70">
            <thead className="bg-black/40 text-xs uppercase text-white/50">
              <tr>
                <th className="px-4 py-3 text-right">نام</th>
                <th className="px-4 py-3 text-right">برند</th>
                <th className="px-4 py-3 text-right">دسته‌بندی</th>
                <th className="px-4 py-3 text-right">قیمت</th>
                <th className="px-4 py-3 text-right">خودروها</th>
                <th className="px-4 py-3 text-right">اقدامات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 bg-black/20">
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="px-4 py-3 text-white">{product.name}</td>
                  <td className="px-4 py-3">{product.brand.name}</td>
                  <td className="px-4 py-3">{product.category.name}</td>
                  <td className="px-4 py-3">{formatPrice(product.price)}</td>
                  <td className="px-4 py-3 text-xs">
                    {product.carMappings.length ? (
                      <div className="flex flex-wrap gap-2">
                        {product.carMappings.map(({ car }) => (
                          <span key={car.id} className="rounded-full border border-white/15 px-2 py-1">
                            {car.manufacturer} {car.model}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-white/40">تخصیص‌نیافته</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <form action={deleteProductFormAction} className="inline">
                      <input type="hidden" name="productId" value={product.id} />
                      <button type="submit" className="rounded-full border border-red-400/40 px-3 py-1 text-xs text-red-200 hover:border-red-300 hover:text-red-100">
                        حذف
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
