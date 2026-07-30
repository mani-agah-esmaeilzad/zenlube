import { cn } from "@/lib/utils";

type SkeletonProps = {
  className?: string;
};

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-[20px] bg-[linear-gradient(180deg,#EEF1F5_0%,#E6EAF0_100%)]",
        className,
      )}
    />
  );
}
