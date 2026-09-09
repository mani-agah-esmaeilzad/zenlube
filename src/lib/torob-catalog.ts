import prisma from "@/lib/prisma";
import { storefrontVisibleProductWhere } from "@/lib/storefront-visibility";
import { TOROB_PAGE_SIZE, type TorobProductRequest } from "@/lib/torob";

const productSelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  price: true,
  stock: true,
  imageUrl: true,
  viscosity: true,
  oilType: true,
  approvals: true,
  originCountry: true,
  packagingSizeLit: true,
  warranty: true,
  technicalSpecs: true,
  createdAt: true,
  updatedAt: true,
  brand: { select: { name: true } },
  category: { select: { name: true } },
  promotion: true,
} as const;

function productSlugFromUrl(value: string) {
  try {
    const segments = new URL(value).pathname.split("/").filter(Boolean);
    const productIndex = segments.lastIndexOf("products");
    return productIndex >= 0 && segments[productIndex + 1] ? decodeURIComponent(segments[productIndex + 1]) : null;
  } catch {
    return null;
  }
}

export async function queryTorobProducts(input: TorobProductRequest) {
  // Out-of-stock and not-yet-priced products must remain discoverable and
  // addressable so Torob can update their availability instead of deleting them.
  const baseWhere = storefrontVisibleProductWhere();

  if (input.type === "page") {
    const skip = (input.page - 1) * TOROB_PAGE_SIZE;
    const orderBy = [
      input.sort === "date_updated_desc" ? { updatedAt: "desc" as const } : { createdAt: "desc" as const },
      { id: "desc" as const },
    ];
    const [products, total] = await prisma.$transaction([
      prisma.product.findMany({ where: baseWhere, select: productSelect, orderBy, skip, take: TOROB_PAGE_SIZE }),
      prisma.product.count({ where: baseWhere }),
    ]);
    return { products, total, currentPage: input.page };
  }

  const identifiers = input.type === "uniques"
    ? input.values
    : input.values.map(productSlugFromUrl).filter((value): value is string => Boolean(value));
  const products = await prisma.product.findMany({
    where: storefrontVisibleProductWhere({
      ...(input.type === "uniques" ? { id: { in: identifiers } } : { slug: { in: identifiers } }),
    }),
    select: productSelect,
  });
  const positions = new Map(identifiers.map((id, index) => [id, index]));
  const indexOf = (product: (typeof products)[number]) => positions.get(input.type === "uniques" ? product.id : product.slug) ?? -1;
  products.sort((left, right) => indexOf(left) - indexOf(right));
  return { products, total: products.length, currentPage: 1 };
}
