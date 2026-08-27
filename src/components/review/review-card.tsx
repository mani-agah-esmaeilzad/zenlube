import Link from "next/link";
import type { ProductReview } from "@/generated/prisma";

type ReviewCardProps = {
  review: ProductReview & {
    product?: {
      id: string;
      name: string;
      slug: string;
      imageUrl: string | null;
      brand: { name: string };
    };
  };
};

export function ReviewCard({ review }: ReviewCardProps) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-col">
          <span className="text-base font-semibold text-slate-900">
            {review.customerName}
          </span>
          <span className="text-xs text-slate-400">
            {new Intl.DateTimeFormat("fa-IR", {
              dateStyle: "medium",
            }).format(new Date(review.createdAt))}
          </span>
        </div>
        <span className="w-fit rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-600">
          ⭐ {review.rating}/5
        </span>
      </div>
      {review.isVerifiedPurchase ? (
        <span className="w-fit rounded-full bg-green-50 px-3 py-1 text-[11px] font-bold text-[#027A48]">
          خرید تاییدشده
        </span>
      ) : null}
      {review.title ? (
        <p className="text-sm font-bold text-slate-900">{review.title}</p>
      ) : null}
      {review.comment && (
        <p className="break-words leading-7 text-slate-600">“{review.comment}”</p>
      )}
      {review.product && (
        <Link
          href={`/products/${review.product.slug}`}
          className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600 transition hover:border-sky-200 hover:text-slate-900"
        >
          {review.product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={review.product.imageUrl}
              alt={review.product.name}
              className="h-10 w-10 rounded-full object-cover"
              loading="lazy"
            />
          ) : (
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-400 shadow">
              محصول
            </span>
          )}
          <span className="min-w-0 break-words leading-6">
            {review.product.brand.name} – {review.product.name}
          </span>
        </Link>
      )}
    </div>
  );
}
