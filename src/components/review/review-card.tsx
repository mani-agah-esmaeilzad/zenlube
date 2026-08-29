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
    <article className="flex flex-col gap-3 border-b border-border py-5 text-sm text-slate-600 first:pt-0 last:border-b-0">
      <div className="flex items-start justify-between gap-3">
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
        <span className="shrink-0 text-xs font-bold text-amber-700">
          ⭐ {review.rating}/5
        </span>
      </div>
      {review.isVerifiedPurchase ? (
        <span className="w-fit text-[11px] font-bold text-[#027A48]">خرید تاییدشده</span>
      ) : null}
      {review.title ? (
        <p className="text-sm font-bold text-slate-900">{review.title}</p>
      ) : null}
      {review.comment && (
        <blockquote className="break-words border-r-2 border-primary-accent py-1 pr-4 leading-7 text-slate-600">“{review.comment}”</blockquote>
      )}
      {review.product && (
        <Link
          href={`/products/${review.product.slug}`}
          className="flex min-h-11 w-fit max-w-full items-center gap-3 text-xs text-slate-600 transition hover:text-primary-accent-strong"
        >
          {review.product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={review.product.imageUrl}
              alt={review.product.name}
              className="h-10 w-10 rounded-lg object-cover"
              loading="lazy"
            />
          ) : null}
          <span className="min-w-0 break-words leading-6">
            {review.product.brand.name} – {review.product.name}
          </span>
        </Link>
      )}
    </article>
  );
}
