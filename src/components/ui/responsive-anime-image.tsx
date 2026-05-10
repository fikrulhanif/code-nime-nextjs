"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Anime, Character } from "@/types/anime";

interface ResponsiveAnimeImageProps {
  anime?: Anime;
  character?: Character;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
  sizes?: string;
  quality?: number;
  onError?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
}

/**
 * Responsive anime image component that loads appropriate image size based on viewport
 * - Loads small_image_url for viewport < 768px
 * - Loads image_url for viewport 768px-1023px
 * - Loads large_image_url for viewport ≥ 1024px
 * - Enables lazy loading with 200px margin (via loading="lazy")
 */
export function ResponsiveAnimeImage({
  anime,
  character,
  alt,
  fill = false,
  width,
  height,
  priority = false,
  className = "",
  sizes,
  quality,
  onError,
}: ResponsiveAnimeImageProps) {
  const [imageUrl, setImageUrl] = useState<string>("");

  // Determine which image URL to use based on viewport width
  useEffect(() => {
    const updateImageUrl = () => {
      const viewportWidth = window.innerWidth;
      let url = "";

      if (anime) {
        // Select image based on viewport width
        if (viewportWidth < 768) {
          // Mobile: use small_image_url
          url =
            anime.images?.jpg?.small_image_url ||
            anime.images?.webp?.small_image_url ||
            anime.images?.jpg?.image_url ||
            "/placeholder-anime.svg";
        } else if (viewportWidth >= 768 && viewportWidth < 1024) {
          // Tablet: use image_url
          url =
            anime.images?.jpg?.image_url ||
            anime.images?.webp?.image_url ||
            anime.images?.jpg?.large_image_url ||
            "/placeholder-anime.svg";
        } else {
          // Desktop: use large_image_url
          url =
            anime.images?.jpg?.large_image_url ||
            anime.images?.webp?.large_image_url ||
            anime.images?.jpg?.image_url ||
            "/placeholder-anime.svg";
        }
      } else if (character) {
        // Characters only have one image size
        // Handle both nested and flat character structure
        const charData = (character as any).character || character;
        url =
          charData.images?.jpg?.image_url ||
          charData.images?.webp?.image_url ||
          "/placeholder-character.svg";
      }

      setImageUrl(url);
    };

    // Set initial image URL
    updateImageUrl();

    // Update image URL on viewport resize
    const handleResize = () => {
      updateImageUrl();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [anime, character]);

  // Don't render until we have an image URL
  if (!imageUrl) {
    return null;
  }

  return (
    <Image
      src={imageUrl}
      alt={alt}
      fill={fill}
      width={width}
      height={height}
      priority={priority}
      loading={priority ? undefined : "lazy"}
      className={className}
      sizes={sizes}
      quality={quality}
      onError={onError}
    />
  );
}
