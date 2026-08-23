import { Skeleton } from "@/components/ui/skeleton";

export default function StorefrontLoading() {
  return (
    <div className="container-zen py-6 md:py-8">
      <div className="space-y-6">
        <Skeleton className="h-8 w-36" />
        <div className="space-y-3">
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-5 w-full max-w-xl" />
        </div>
        <div className="grid gap-4 min-[360px]:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="rounded-2xl border border-border p-3">
              <Skeleton className="aspect-[4/3] w-full rounded-xl" />
              <Skeleton className="mt-4 h-4 w-20" />
              <Skeleton className="mt-3 h-5 w-full" />
              <Skeleton className="mt-2 h-5 w-4/5" />
              <Skeleton className="mt-5 h-10 w-full rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
