import { Skeleton } from "@/components/ui/skeleton";

export default function StorefrontLoading() {
  return (
    <div className="container-zen py-6 md:py-8">
      <div className="space-y-6">
        <Skeleton className="h-8 w-36" />
        <div className="panel-zen rounded-[32px] p-5">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="mt-4 h-10 w-full rounded-2xl" />
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <Skeleton className="h-24 w-full rounded-3xl" />
            <Skeleton className="h-24 w-full rounded-3xl" />
            <Skeleton className="h-24 w-full rounded-3xl" />
          </div>
        </div>
        <div className="grid gap-4 min-[360px]:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="panel-zen rounded-[28px] p-4">
              <Skeleton className="aspect-[4/5] w-full rounded-[24px]" />
              <Skeleton className="mt-4 h-4 w-20" />
              <Skeleton className="mt-3 h-5 w-full" />
              <Skeleton className="mt-2 h-5 w-4/5" />
              <div className="mt-4 flex gap-2">
                <Skeleton className="h-7 w-20 rounded-full" />
                <Skeleton className="h-7 w-24 rounded-full" />
              </div>
              <Skeleton className="mt-5 h-12 w-full rounded-2xl" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
