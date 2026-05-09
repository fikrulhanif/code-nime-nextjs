import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface DetailSkeletonProps {
  className?: string;
}

export function DetailSkeleton({ className }: DetailSkeletonProps) {
  return (
    <div className={cn("w-full space-y-8", className)}>
      {/* Hero Section Skeleton */}
      <div className="relative min-h-[400px] w-full overflow-hidden md:min-h-[500px]">
        {/* Backdrop Skeleton */}
        <Skeleton className="absolute inset-0 h-full w-full rounded-none" />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />

        {/* Content */}
        <div className="relative z-10 flex h-full items-end px-4 pb-8 md:px-8 md:pb-12 lg:px-16">
          <div className="flex w-full flex-col gap-6 md:flex-row md:items-end">
            {/* Poster Skeleton */}
            <Skeleton className="h-[300px] w-[200px] shrink-0 rounded-lg md:h-[400px] md:w-[280px]" />

            {/* Info */}
            <div className="flex-1 space-y-4">
              <div className="space-y-3">
                <Skeleton className="h-10 w-3/4 md:h-14" />
                <Skeleton className="h-10 w-1/2 md:h-14" />
              </div>

              <div className="flex flex-wrap gap-3">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-24" />
              </div>

              <div className="flex gap-3">
                <Skeleton className="h-11 w-36 rounded-md" />
                <Skeleton className="h-11 w-40 rounded-md" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Section Skeleton */}
      <div className="mx-auto max-w-7xl space-y-8 px-4 md:px-8 lg:px-16">
        {/* Synopsis */}
        <div className="space-y-4">
          <Skeleton className="h-8 w-32" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>

        {/* Metadata Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-6 w-32" />
            </div>
          ))}
        </div>

        {/* Genres */}
        <div className="space-y-4">
          <Skeleton className="h-8 w-24" />
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-20 rounded-full" />
            ))}
          </div>
        </div>

        {/* Characters Section */}
        <div className="space-y-4">
          <Skeleton className="h-8 w-32" />
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="flex gap-3 rounded-lg border border-border/50 bg-card p-3"
              >
                <Skeleton className="h-16 w-16 shrink-0 rounded-md" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-6 w-20" />
          </div>
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton
                key={i}
                className="h-[300px] w-[200px] shrink-0 rounded-lg"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
