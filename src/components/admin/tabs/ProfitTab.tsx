import Link from "next/link";

import { ProductPurchaseCostForm } from "@/components/admin/forms/ProductPurchaseCostForm";
import { faNumberFormatter } from "@/lib/formatters";
import { formatPrice } from "@/lib/utils";
import type { getProfitTabData } from "@/services/admin/profit";

type ProfitData = Awaited<ReturnType<typeof getProfitTabData>>;

export function ProfitTab({ data }: { data: ProfitData }) {
  const { products, metrics } = data;
  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
        <Metric label="محصول موجود" value={faNumberFormatter.format(metrics.inStockProducts)} />
        <Metric label="فروش محصولات موجود" value={formatPrice(metrics.recordedSales)} helper="پس از کسر تخفیف سفارش؛ فقط سفارش موفق" />
        <Metric label="سود ناخالص برآوردی" value={formatPrice(metrics.estimatedProfit)} helper={`بر مبنای ${faNumberFormatter.format(metrics.inStockProducts - metrics.missingCostProducts)} محصول قیمت‌گذاری‌شده`} />
        <Metric label="ارزش بهای موجودی" value={formatPrice(metrics.inventoryCost)} helper="فقط محصولاتی که بهای خریدشان ثبت شده" />
      </section>

      <section className="admin-panel flex flex-col gap-3 p-5 md:flex-row md:items-start md:justify-between md:p-6">
        <div>
          <h2 className="text-xl font-black text-[#111827]">بهای خرید و سود محصولات موجود</h2>
          <p className="mt-2 max-w-4xl text-sm leading-7 text-[#667085]">
            مبلغ‌ها به ریال هستند. سود این صفحه برآورد سود ناخالص کالاست: فروش پس از تخفیف منهای بهای خرید ثبت‌شده. چون سابقهٔ قیمت خرید قبلی نگهداری نشده، فروش‌های گذشته هم با بهای خرید فعلی سنجیده می‌شوند؛ هزینهٔ ارسال، کارمزد پرداخت، مالیات و سایر هزینه‌های کسب‌وکار در محاسبه نیستند.
          </p>
          {metrics.missingCostProducts > 0 ? (
            <p className="mt-3 rounded-2xl border border-[#FDE68A] bg-[#FFFBEB] px-4 py-3 text-xs font-bold leading-6 text-[#92400E]">
              برای {faNumberFormatter.format(metrics.missingCostProducts)} محصول هنوز قیمت خرید ثبت نشده؛ سود کلی فقط محصولاتی را پوشش می‌دهد که بهای خریدشان مشخص است.
            </p>
          ) : null}
        </div>
        <span className="admin-chip shrink-0">فروش موفق · همهٔ دوره‌ها</span>
      </section>

      <section className="admin-panel overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-right text-sm">
            <thead className="bg-[#F8FAFC] text-xs text-[#667085]">
              <tr>
                <th className="px-5 py-4 font-bold">محصول</th>
                <th className="px-4 py-4 font-bold">موجودی</th>
                <th className="px-4 py-4 font-bold">قیمت فروش</th>
                <th className="px-4 py-4 font-bold">بهای خرید (ریال)</th>
                <th className="px-4 py-4 font-bold">فروش موفق</th>
                <th className="px-4 py-4 font-bold">فروش پس از تخفیف</th>
                <th className="px-5 py-4 font-bold">سود ناخالص تخمینی</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEF1F5]">
              {products.map((product) => (
                <tr key={product.id} className="align-middle">
                  <td className="px-5 py-4">
                    <Link className="font-black text-[#111827] hover:text-[#C2410C]" href={`/products/${product.slug}`} target="_blank">
                      {product.name}
                    </Link>
                    <p className="mt-1 text-xs text-[#98A2B3]">{product.brandName}</p>
                  </td>
                  <td className="px-4 py-4 font-bold text-[#344054]">{faNumberFormatter.format(product.stock)}</td>
                  <td className="px-4 py-4 text-[#475467]">{formatPrice(product.price)}</td>
                  <td className="px-4 py-4"><ProductPurchaseCostForm productId={product.id} purchaseCost={product.purchaseCost} /></td>
                  <td className="px-4 py-4 text-[#475467]">{faNumberFormatter.format(product.soldQuantity)}</td>
                  <td className="px-4 py-4 text-[#475467]">{formatPrice(product.netRevenue)}</td>
                  <td className={`px-5 py-4 font-black ${product.estimatedProfit == null ? "text-[#B54708]" : product.estimatedProfit < 0 ? "text-[#B42318]" : "text-[#027A48]"}`}>
                    {product.estimatedProfit == null ? "ثبت بهای خرید" : formatPrice(product.estimatedProfit)}
                  </td>
                </tr>
              ))}
              {!products.length ? <tr><td className="px-5 py-12 text-center text-sm text-[#667085]" colSpan={7}>فعلاً محصول موجودی برای نمایش نیست.</td></tr> : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Metric({ label, value, helper }: { label: string; value: string; helper?: string }) {
  return (
    <div className="admin-kpi min-w-0">
      <p className="admin-kpi-label">{label}</p>
      <p className="admin-kpi-value break-words">{value}</p>
      {helper ? <p className="admin-kpi-helper">{helper}</p> : null}
    </div>
  );
}
