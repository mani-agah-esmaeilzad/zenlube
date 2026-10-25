import { adminCatalogProductWhere } from "@/lib/storefront-visibility";
import prisma from "@/lib/prisma";

type ProductProfitRow = {
  id: string;
  name: string;
  slug: string;
  brandName: string;
  stock: number;
  price: string;
  purchaseCost: string | null;
  soldQuantity: bigint;
  grossRevenue: string;
  netRevenue: string;
};

function numeric(value: string | null | undefined) {
  if (value == null) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function getProfitTabData() {
  const [products, sales] = await Promise.all([
    prisma.product.findMany({
      where: adminCatalogProductWhere({ stock: { gt: 0 } }),
      select: {
        id: true,
        name: true,
        slug: true,
        stock: true,
        price: true,
        purchaseCost: true,
        brand: { select: { name: true } },
      },
      orderBy: [{ brand: { name: "asc" } }, { name: "asc" }],
    }),
    prisma.$queryRaw<ProductProfitRow[]>`
      WITH eligible_orders AS (
        SELECT o."id", GREATEST(o."discountAmount"::numeric, 0) AS discount_amount
        FROM "Order" o
        WHERE o."status" IN ('PAID', 'PREPARING', 'SHIPPED', 'DELIVERED')
          AND NOT EXISTS (
            SELECT 1 FROM "ReturnRequest" r
            WHERE r."orderId" = o."id" AND r."status" = 'REFUNDED'
          )
      ), order_lines AS (
        SELECT
          oi."productId" AS product_id,
          oi."orderId" AS order_id,
          oi."quantity" AS quantity,
          (oi."price"::numeric * oi."quantity") AS line_gross,
          SUM(oi."price"::numeric * oi."quantity") OVER (PARTITION BY oi."orderId") AS order_subtotal,
          eo.discount_amount
        FROM "OrderItem" oi
        JOIN eligible_orders eo ON eo."id" = oi."orderId"
      ), product_sales AS (
        SELECT
          product_id,
          SUM(quantity)::bigint AS sold_quantity,
          SUM(line_gross) AS gross_revenue,
          SUM(
            line_gross - CASE
              WHEN order_subtotal > 0
                THEN LEAST(discount_amount, order_subtotal) * line_gross / order_subtotal
              ELSE 0
            END
          ) AS net_revenue
        FROM order_lines
        GROUP BY product_id
      )
      SELECT
        p."id",
        p."name",
        p."slug",
        b."name" AS "brandName",
        p."stock",
        p."price"::text AS "price",
        p."purchaseCost"::text AS "purchaseCost",
        COALESCE(ps.sold_quantity, 0)::bigint AS "soldQuantity",
        COALESCE(ps.gross_revenue, 0)::text AS "grossRevenue",
        COALESCE(ps.net_revenue, 0)::text AS "netRevenue"
      FROM "Product" p
      JOIN "Brand" b ON b."id" = p."brandId"
      LEFT JOIN product_sales ps ON ps.product_id = p."id"
      WHERE p."stock" > 0 AND p."slug" NOT LIKE 'deleted-%'
      ORDER BY b."name" ASC, p."name" ASC
    `,
  ]);

  const productById = new Map(products.map((product) => [product.id, product]));
  const rows = sales.flatMap((sale) => {
    const product = productById.get(sale.id);
    if (!product) return [];
    const purchaseCost = product.purchaseCost == null ? null : Number(product.purchaseCost);
    const netRevenue = numeric(sale.netRevenue) ?? 0;
    const soldQuantity = Number(sale.soldQuantity);
    const costOfGoods = purchaseCost == null ? null : purchaseCost * soldQuantity;
    return [{
      id: product.id,
      name: product.name,
      slug: product.slug,
      brandName: product.brand.name,
      stock: product.stock,
      price: Number(product.price),
      purchaseCost,
      soldQuantity,
      grossRevenue: numeric(sale.grossRevenue) ?? 0,
      netRevenue,
      costOfGoods,
      estimatedProfit: costOfGoods == null ? null : netRevenue - costOfGoods,
      inventoryCost: purchaseCost == null ? null : purchaseCost * product.stock,
    }];
  });

  const pricedRows = rows.filter((row) => row.estimatedProfit != null);
  return {
    products: rows,
    metrics: {
      inStockProducts: rows.length,
      missingCostProducts: rows.filter((row) => row.purchaseCost == null).length,
      recordedSales: rows.reduce((sum, row) => sum + row.netRevenue, 0),
      costedSales: pricedRows.reduce((sum, row) => sum + row.netRevenue, 0),
      estimatedProfit: pricedRows.reduce((sum, row) => sum + (row.estimatedProfit ?? 0), 0),
      inventoryCost: rows.reduce((sum, row) => sum + (row.inventoryCost ?? 0), 0),
    },
  };
}
