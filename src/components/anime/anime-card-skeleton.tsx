import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface AnimeCardSkeletonProps {
  variant?: "default" | "compact" | "detailed";
  count?: number;
  className?: string;
}

export function AnimeCardSkeleton({
  variant = "default",
  count = 1,
  className,
}: AnimeCardSkeletonProps) {
  const skeletons = Array.from({ length: count }, (_, i) => i);

  const dimensions = {
    default: "w-[280px] h-[420px]",
    compact: "w-[200px] h-[300px]",
    detailed: "w-[320px] h-[480px]",
  };

  const posterHeights = {
    default: "h-[320px]",
    compact: "h-[220px]",
    detailed: "h-[360px]",
  };

  return (
    <>
      {skeletons.map((index) => (
        <div
          key={index}
          className={cn(
            "flex flex-col gap-3 rounded-lg border border-border/50 bg-card p-3",
            dimensions[variant],
            className,
          )}
          aria-label="Loading anime card"
        >
          {/* Poster Image Skeleton */}
          <Skeleton
            className={cn("w-full rounded-md", posterHeights[variant])}
          />

          {/* Title Skeleton */}
          <div className="space-y-2">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-3/4" />
          </div>

          {/* Metadata Skeleton */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-16 rounded-4xl" />
              <Skeleton className="h-4 w-12" />
            </div>
            <Skeleton className="h-4 w-16" />
          </div>

          {/* Synopsis for detailed variant */}
          {variant === "detailed" && (
            <div className="space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          )}

          {/* Watchlist Button Skeleton */}
          <Skeleton className="h-9 w-full rounded-lg" />
        </div>
      ))}
    </>
  );
}
