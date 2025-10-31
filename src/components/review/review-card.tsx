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
    <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-base font-semibold text-slate-900">
            {review.customerName}
          </span>
          <span className="text-xs text-slate-400">
            {new Intl.DateTimeFormat("fa-IR", {
              dateStyle: "medium",
            }).format(new Date(review.createdAt))}
          </span>
        </div>
        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-600">
          ⭐ {review.rating}/5
        </span>
      </div>
      {review.comment && (
        <p className="leading-7 text-slate-600">“{review.comment}”</p>
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
          <span>
            {review.product.brand.name} – {review.product.name}
          </span>
        </Link>
      )}
    </div>
  );
}
