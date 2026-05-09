import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface CardSkeletonProps {
  variant?: "default" | "compact" | "detailed";
  count?: number;
  className?: string;
}

export function CardSkeleton({
  variant = "default",
  count = 1,
  className,
}: CardSkeletonProps) {
  const skeletons = Array.from({ length: count }, (_, i) => i);

  const dimensions = {
    default: "w-[280px] h-[420px]",
    compact: "w-[200px] h-[300px]",
    detailed: "w-[320px] h-[480px]",
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
        >
          {/* Poster Image Skeleton */}
          <Skeleton
            className={cn(
              "w-full rounded-md",
              variant === "default" && "h-[320px]",
              variant === "compact" && "h-[220px]",
              variant === "detailed" && "h-[360px]",
            )}
          />

          {/* Title Skeleton */}
          <div className="space-y-2">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-3/4" />
          </div>

          {/* Metadata Skeleton */}
          <div className="flex items-center justify-between gap-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-12" />
          </div>

          {/* Synopsis for detailed variant */}
          {variant === "detailed" && (
            <div className="space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          )}
        </div>
      ))}
    </>
  );
}
