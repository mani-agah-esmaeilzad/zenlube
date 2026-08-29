import { Skeleton } from "@/components/ui/skeleton";

export default function StorefrontLoading() {
  return (
    <div className="container-zen py-5 sm:py-6 md:py-8">
      <div className="space-y-5 sm:space-y-6">
        <Skeleton className="h-8 w-36" />
        <div className="space-y-3">
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-5 w-full max-w-xl" />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="border-t border-border py-3">
              <Skeleton className="aspect-[4/3] w-full rounded-lg" />
              <Skeleton className="mt-4 h-4 w-20" />
              <Skeleton className="mt-3 h-5 w-full" />
              <Skeleton className="mt-2 h-5 w-4/5" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
