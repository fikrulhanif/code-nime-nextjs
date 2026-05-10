"use client";

import { useEffect, useRef } from "react";

interface LiveRegionProps {
  message: string;
  politeness?: "polite" | "assertive";
  clearOnUnmount?: boolean;
}

/**
 * ARIA live region component for announcing dynamic content updates to screen readers
 * - Use "polite" for non-critical updates (default)
 * - Use "assertive" for critical alerts that need immediate attention
 */
export function LiveRegion({
  message,
  politeness = "polite",
  clearOnUnmount = true,
}: LiveRegionProps) {
  const regionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Clear the message on unmount if specified
    return () => {
      if (clearOnUnmount && regionRef.current) {
        regionRef.current.textContent = "";
      }
    };
  }, [clearOnUnmount]);

  return (
    <div
      ref={regionRef}
      role={politeness === "assertive" ? "alert" : "status"}
      aria-live={politeness}
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  );
}

/**
 * Global live region manager for toast notifications and dynamic updates
 * This should be placed at the root level of the application
 */
export function GlobalLiveRegion() {
  return (
    <>
      {/* Polite region for non-critical updates */}
      <div
        id="live-region-polite"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />

      {/* Assertive region for critical alerts */}
      <div
        id="live-region-assertive"
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      />
    </>
  );
}

/**
 * Utility function to announce messages to screen readers
 * @param message - The message to announce
 * @param politeness - "polite" for non-critical updates, "assertive" for critical alerts
 */
export function announce(
  message: string,
  politeness: "polite" | "assertive" = "polite",
) {
  const regionId =
    politeness === "assertive" ? "live-region-assertive" : "live-region-polite";
  const region = document.getElementById(regionId);

  if (region) {
    // Clear the region first to ensure the same message can be announced multiple times
    region.textContent = "";

    // Use setTimeout to ensure the screen reader picks up the change
    setTimeout(() => {
      region.textContent = message;
    }, 100);
  }
}
