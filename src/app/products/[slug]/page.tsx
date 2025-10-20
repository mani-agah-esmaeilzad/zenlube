import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/product/add-to-cart-button";
import prisma from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";

type ProductPageProps = {
  params: { slug: string };
};

export async function generateMetadata({ params }: ProductPageProps) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    select: { name: true, description: true },
  });

  if (!product) {
    return {
      title: "محصول یافت نشد",
    };
  }

  return {
    title: `${product.name} | ZenLube`,
    description: product.description ?? undefined,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: {
      brand: true,
      category: true,
      carMappings: {
        include: {
          car: true,
        },
      },
    },
  });

  if (!product) {
    notFound();
  }

  const relatedProducts = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id },
    },
    take: 3,
    include: {
      brand: true,
    },
  });

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="grid gap-10 rounded-[40px] border border-white/10 bg-white/5 p-8 lg:grid-cols-[2fr_3fr]">
        <div className="relative aspect-square overflow-hidden rounded-3xl border border-white/10 bg-black/20">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 40vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-white/30">
              تصویر در دسترس نیست
            </div>
          )}
        </div>
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3 text-xs text-white/60">
            <Link href={`/brands?slug=${product.brand.slug}`} className="rounded-full border border-white/15 px-3 py-1">
              {product.brand.name}
            </Link>
            <Link href={`/categories?slug=${product.category.slug}`} className="rounded-full border border-white/15 px-3 py-1">
              {product.category.name}
            </Link>
            {product.viscosity && (
              <span className="rounded-full border border-purple-400/50 bg-purple-500/20 px-3 py-1">
                ویسکوزیته {product.viscosity}
              </span>
            )}
          </div>
          <h1 className="text-3xl font-semibold text-white">{product.name}</h1>
          {product.description && (
            <p className="text-sm leading-7 text-white/70">{product.description}</p>
          )}
          <div className="flex flex-wrap gap-6 rounded-3xl border border-white/10 bg-black/30 p-6 text-sm text-white/70">
            <div>
              <span className="block text-xs text-white/50">قیمت</span>
              <span className="text-2xl font-bold text-purple-200">{formatPrice(product.price)}</span>
            </div>
            <div>
              <span className="block text-xs text-white/50">موجودی</span>
              <span>{product.stock > 0 ? `${product.stock} عدد` : "ناموجود"}</span>
            </div>
            {product.oilType && (
              <div>
                <span className="block text-xs text-white/50">نوع روغن</span>
                <span>{product.oilType}</span>
              </div>
            )}
            {product.sku && (
              <div>
                <span className="block text-xs text-white/50">کد کالا</span>
                <span>{product.sku}</span>
              </div>
            )}
          </div>
          <AddToCartButton productId={product.id} className="max-w-xs" />
          {product.carMappings.length > 0 && (
            <div className="space-y-3 rounded-3xl border border-purple-500/30 bg-purple-950/30 p-6">
              <h2 className="text-lg font-semibold text-purple-100">
                خودروهای سازگار با این محصول
              </h2>
              <ul className="grid gap-3 text-sm text-white/80">
                {product.carMappings.map(({ car }) => (
                  <li key={car.id} className="flex flex-wrap items-center gap-3">
                    <Link href={`/cars#${car.slug}`} className="rounded-full bg-white/10 px-3 py-1 text-xs">
                      {car.manufacturer} {car.model}
                    </Link>
                    {car.viscosity && <span className="text-xs text-white/50">ویسکوزیته پیشنهادی: {car.viscosity}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <section className="mt-12 space-y-4">
          <h2 className="text-lg font-semibold text-white">محصولات مشابه</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {relatedProducts.map((item) => (
              <Link
                key={item.id}
                href={`/products/${item.slug}`}
                className="rounded-3xl border border-white/10 bg-white/5 p-6 transition hover:border-purple-400/60"
              >
                <div className="flex flex-col gap-2">
                  <span className="text-xs text-white/50">{item.brand.name}</span>
                  <span className="text-base font-semibold text-white">{item.name}</span>
                  <span className="text-xs text-white/40">{formatPrice(item.price)}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
