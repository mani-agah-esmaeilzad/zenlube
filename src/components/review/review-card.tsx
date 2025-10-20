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
    <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-white/70">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-base font-semibold text-white">
            {review.customerName}
          </span>
          <span className="text-xs text-white/40">
            {new Intl.DateTimeFormat("fa-IR", {
              dateStyle: "medium",
            }).format(new Date(review.createdAt))}
          </span>
        </div>
        <span className="rounded-full bg-purple-500/20 px-3 py-1 text-xs font-semibold text-purple-100">
          ⭐ {review.rating}/5
        </span>
      </div>
      {review.comment && (
        <p className="leading-7 text-white/80">“{review.comment}”</p>
      )}
      {review.product && (
        <Link
          href={`/products/${review.product.slug}`}
          className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/30 px-3 py-2 text-xs text-white/70 transition hover:border-purple-300 hover:text-white"
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
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/50">
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
