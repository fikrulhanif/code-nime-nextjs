/**
 * Responsive Breakpoints Hook
 * Requirement 20.9: Update responsive layout within 150ms of resize event
 */

import { useState, useEffect } from "react";

// Tailwind breakpoints (matching default Tailwind v4 breakpoints)
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

interface ResponsiveState {
  width: number;
  height: number;
  isMobile: boolean; // < 768px
  isTablet: boolean; // 768px - 1023px
  isDesktop: boolean; // >= 1024px
  breakpoint: Breakpoint | "xs";
  orientation: "portrait" | "landscape";
}

/**
 * Hook to track viewport size and responsive breakpoints
 * Updates within 200ms of viewport/orientation changes
 */
export function useResponsive(): ResponsiveState {
  const [state, setState] = useState<ResponsiveState>(() => {
    // Server-side rendering fallback
    if (typeof window === "undefined") {
      return {
        width: 1024,
        height: 768,
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        breakpoint: "lg",
        orientation: "landscape",
      };
    }

    return getResponsiveState();
  });

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleResize = () => {
      // Debounce to 150ms as per requirement 20.9
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setState(getResponsiveState());
      }, 150);
    };

    // Listen to both resize and orientationchange events
    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, []);

  return state;
}

/**
 * Get current responsive state based on viewport dimensions
 */
function getResponsiveState(): ResponsiveState {
  const width = window.innerWidth;
  const height = window.innerHeight;

  // Determine breakpoint
  let breakpoint: Breakpoint | "xs" = "xs";
  if (width >= BREAKPOINTS["2xl"]) {
    breakpoint = "2xl";
  } else if (width >= BREAKPOINTS.xl) {
    breakpoint = "xl";
  } else if (width >= BREAKPOINTS.lg) {
    breakpoint = "lg";
  } else if (width >= BREAKPOINTS.md) {
    breakpoint = "md";
  } else if (width >= BREAKPOINTS.sm) {
    breakpoint = "sm";
  }

  // Determine device type
  const isMobile = width < BREAKPOINTS.md; // < 768px
  const isTablet = width >= BREAKPOINTS.md && width < BREAKPOINTS.lg; // 768px - 1023px
  const isDesktop = width >= BREAKPOINTS.lg; // >= 1024px

  // Determine orientation
  const orientation = width > height ? "landscape" : "portrait";

  return {
    width,
    height,
    isMobile,
    isTablet,
    isDesktop,
    breakpoint,
    orientation,
  };
}

/**
 * Hook to check if viewport matches a specific breakpoint
 */
export function useBreakpoint(breakpoint: Breakpoint): boolean {
  const { width } = useResponsive();
  return width >= BREAKPOINTS[breakpoint];
}

/**
 * Hook to get the number of columns for grid layouts based on viewport
 * Requirement 19.2, 19.3, 19.4: Responsive grid columns
 */
export function useGridColumns(): number {
  const { width } = useResponsive();

  if (width < BREAKPOINTS.md) {
    return 1; // Mobile: 1 column
  } else if (width < BREAKPOINTS.lg) {
    return 2; // Tablet: 2 columns
  } else {
    return 4; // Desktop: 4 columns
  }
}

/**
 * Hook to get the number of carousel slides per view based on viewport
 * Requirement 19.5, 19.6, 19.7: Responsive carousel slides
 */
export function useCarouselSlides(): number {
  const { width } = useResponsive();

  if (width < BREAKPOINTS.sm) {
    return 1; // < 640px: 1 slide
  } else if (width < BREAKPOINTS.lg) {
    return 2; // 640px - 1023px: 2 slides
  } else {
    return 3; // >= 1024px: 3 slides
  }
}
