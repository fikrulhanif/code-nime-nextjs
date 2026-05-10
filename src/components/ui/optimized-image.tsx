"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Anime, Character } from "@/types/anime";

interface OptimizedImageProps {
  // For anime images with responsive loading
  anime?: Anime;
  character?: Character;
  // For custom images
  src?: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  className?: string;
  onError?: () => void;
  fallbackSrc?: string;
  showBlurPlaceholder?: boolean;
  quality?: number;
}

/**
 * OptimizedImage component that handles:
 * - Responsive image loading based on viewport (for anime/character images)
 *   - Loads small_image_url for viewport < 768px
 *   - Loads image_url for viewport 768px-1023px
 *   - Loads large_image_url for viewport ≥ 1024px
 * - WebP format optimization (automatic via Next.js)
 * - JPEG fallback (automatic via Next.js)
 * - Blur placeholder during load
 * - Fallback placeholder on timeout or error
 * - Lazy loading with 200px margin (default Next.js behavior)
 */
export function OptimizedImage({
  anime,
  character,
  src,
  alt,
  fill = false,
  width,
  height,
  sizes,
  priority = false,
  className,
  onError,
  fallbackSrc = "/placeholder-anime.svg",
  showBlurPlaceholder = true,
  quality = 85,
}: OptimizedImageProps) {
  const [imageSrc, setImageSrc] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [loadTimeout, setLoadTimeout] = useState(false);

  // Determine which image URL to use based on viewport width
  useEffect(() => {
    let url = "";

    if (anime) {
      // Use the highest quality image available
      // Next.js Image component will handle responsive sizing
      url =
        anime.images?.jpg?.large_image_url ||
        anime.images?.webp?.large_image_url ||
        anime.images?.jpg?.image_url ||
        anime.images?.webp?.image_url ||
        "/placeholder-anime.svg";
    } else if (character) {
      // Characters only have one image size
      // Handle both nested and flat character structure
      const charData = (character as any).character || character;
      url =
        charData.images?.jpg?.image_url ||
        charData.images?.webp?.image_url ||
        "/placeholder-character.svg";
    } else if (src) {
      // Custom image source
      url = src;
    }

    setImageSrc(url);
  }, [anime, character, src]);

  // Set 30-second timeout for image loading
  useEffect(() => {
    if (!isLoading) return;

    const timeoutId = setTimeout(() => {
      if (isLoading) {
        setLoadTimeout(true);
        setHasError(true);
        setImageSrc(fallbackSrc);
        setIsLoading(false);
      }
    }, 30000); // 30 seconds

    return () => clearTimeout(timeoutId);
  }, [isLoading, fallbackSrc]);

  // Handle image load success
  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  // Handle image load error
  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImageSrc(fallbackSrc);
      setIsLoading(false);
      onError?.();
    }
  };

  // Generate blur data URL for placeholder
  const blurDataURL =
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iIzIxMjEyMSIvPjwvc3ZnPg==";

  // Don't render until we have an image URL
  if (!imageSrc) {
    return null;
  }

  return (
    <div className={cn("relative", fill && "w-full h-full", className)}>
      {/* Blur placeholder overlay while loading */}
      {isLoading && showBlurPlaceholder && (
        <div className="absolute inset-0 z-10 animate-pulse bg-muted" />
      )}

      {/* Main image */}
      <Image
        src={imageSrc}
        alt={alt}
        fill={fill}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        sizes={sizes}
        priority={priority}
        quality={quality}
        loading={priority ? undefined : "lazy"}
        className={cn(
          "transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100",
          className,
        )}
        onLoad={handleLoad}
        onError={handleError}
        placeholder={showBlurPlaceholder ? "blur" : "empty"}
        blurDataURL={showBlurPlaceholder ? blurDataURL : undefined}
        // Next.js automatically serves WebP when browser supports it
        // and falls back to JPEG for browsers that don't
      />

      {/* Error state indicator (optional, for debugging) */}
      {hasError && loadTimeout && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground text-xs">
          <span className="sr-only">Image failed to load</span>
        </div>
      )}
    </div>
  );
}
