"use client";

import { useEffect } from "react";
import { reportWebVitals, measureTTI } from "@/lib/web-vitals";

/**
 * Client component to initialize performance monitoring
 * Requirements 20.1, 20.2, 20.3: Monitor FCP, LCP, TTI
 */
export function PerformanceMonitor() {
  useEffect(() => {
    // Initialize Web Vitals reporting
    reportWebVitals();

    // Measure TTI separately (not included in web-vitals by default)
    measureTTI();
  }, []);

  return null; // This component doesn't render anything
}
