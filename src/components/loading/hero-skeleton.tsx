import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface HeroSkeletonProps {
  className?: string;
}

export function HeroSkeleton({ className }: HeroSkeletonProps) {
  return (
    <div
      className={cn(
        "relative flex min-h-[400px] w-full items-end overflow-hidden md:min-h-[500px] lg:min-h-[600px]",
        className,
      )}
    >
      {/* Background Image Skeleton */}
      <Skeleton className="absolute inset-0 h-full w-full rounded-none" />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

      {/* Content Container */}
      <div className="relative z-10 w-full px-4 pb-8 md:px-8 md:pb-12 lg:px-16 lg:pb-16">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-4 md:gap-6">
            {/* Title Skeleton */}
            <div className="space-y-3">
              <Skeleton className="h-8 w-3/4 md:h-12 lg:h-16" />
              <Skeleton className="h-8 w-1/2 md:h-12 lg:h-16" />
            </div>

            {/* Metadata Skeleton */}
            <div className="flex items-center gap-4">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-24" />
            </div>

            {/* Synopsis Skeleton */}
            <div className="max-w-3xl space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>

            {/* Action Buttons Skeleton */}
            <div className="flex flex-wrap gap-3">
              <Skeleton className="h-11 w-36 rounded-md" />
              <Skeleton className="h-11 w-40 rounded-md" />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Dots Skeleton */}
      <div className="absolute bottom-4 right-4 z-10 flex gap-2 md:bottom-6 md:right-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-2 w-8 rounded-full" />
        ))}
      </div>
    </div>
  );
}
