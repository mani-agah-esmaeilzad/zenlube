import { EmptyState } from "@/components/ui/empty-state";

export default function StorefrontNotFound() {
  return (
    <div className="container-zen py-12 md:py-16">
      <div className="mx-auto max-w-2xl">
        <EmptyState
          actionHref="/products"
          actionLabel="بازگشت به فروشگاه"
          description="ممکن است آدرس صفحه تغییر کرده باشد یا محتوای موردنظر دیگر در فروشگاه فعال نباشد."
          title="صفحه موردنظر پیدا نشد"
        />
      </div>
    </div>
  );
}
