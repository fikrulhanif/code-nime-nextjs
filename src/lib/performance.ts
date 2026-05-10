/**
 * Performance monitoring utilities
 * Tracks Core Web Vitals: FCP, LCP, TTI
 * Requirements 20.1, 20.2, 20.3
 */

export interface PerformanceMetrics {
  fcp?: number; // First Contentful Paint
  lcp?: number; // Largest Contentful Paint
  tti?: number; // Time to Interactive
  cls?: number; // Cumulative Layout Shift
  fid?: number; // First Input Delay
}

/**
 * Report Core Web Vitals to console (can be extended to send to analytics)
 */
export function reportWebVitals(metric: PerformanceMetrics) {
  if (process.env.NODE_ENV === "development") {
    console.log("[Performance]", metric);
  }

  // In production, you would send this to your analytics service
  // Example: sendToAnalytics(metric);
}

/**
 * Measure First Contentful Paint (FCP)
 * Target: < 1.5s
 */
export function measureFCP(): Promise<number | null> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !("PerformanceObserver" in window)) {
      resolve(null);
      return;
    }

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const fcpEntry = entries.find(
          (entry) => entry.name === "first-contentful-paint",
        );

        if (fcpEntry) {
          const fcp = fcpEntry.startTime;
          reportWebVitals({ fcp });
          observer.disconnect();
          resolve(fcp);
        }
      });

      observer.observe({ entryTypes: ["paint"] });

      // Timeout after 10 seconds
      setTimeout(() => {
        observer.disconnect();
        resolve(null);
      }, 10000);
    } catch (error) {
      console.error("Error measuring FCP:", error);
      resolve(null);
    }
  });
}

/**
 * Measure Largest Contentful Paint (LCP)
 * Target: < 2.5s
 */
export function measureLCP(): Promise<number | null> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !("PerformanceObserver" in window)) {
      resolve(null);
      return;
    }

    try {
      let lcpValue = 0;
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as PerformanceEntry & {
          renderTime?: number;
          loadTime?: number;
        };

        if (lastEntry) {
          lcpValue =
            lastEntry.renderTime || lastEntry.loadTime || lastEntry.startTime;
        }
      });

      observer.observe({ entryTypes: ["largest-contentful-paint"] });

      // Report LCP when page is hidden or after 10 seconds
      const reportLCP = () => {
        if (lcpValue > 0) {
          reportWebVitals({ lcp: lcpValue });
          observer.disconnect();
          resolve(lcpValue);
        } else {
          resolve(null);
        }
      };

      // Report on page hide
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden") {
          reportLCP();
        }
      });

      // Timeout after 10 seconds
      setTimeout(reportLCP, 10000);
    } catch (error) {
      console.error("Error measuring LCP:", error);
      resolve(null);
    }
  });
}

/**
 * Measure Time to Interactive (TTI)
 * Target: < 3.5s
 *
 * Note: TTI is complex to measure accurately. This is a simplified version
 * that uses the load event as a proxy.
 */
export function measureTTI(): Promise<number | null> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(null);
      return;
    }

    try {
      // If page is already loaded
      if (document.readyState === "complete") {
        const tti = performance.now();
        reportWebVitals({ tti });
        resolve(tti);
        return;
      }

      // Wait for load event
      window.addEventListener("load", () => {
        // Use a small delay to ensure all scripts have executed
        setTimeout(() => {
          const tti = performance.now();
          reportWebVitals({ tti });
          resolve(tti);
        }, 100);
      });

      // Timeout after 15 seconds
      setTimeout(() => {
        resolve(null);
      }, 15000);
    } catch (error) {
      console.error("Error measuring TTI:", error);
      resolve(null);
    }
  });
}

/**
 * Measure Cumulative Layout Shift (CLS)
 * Target: < 0.1
 */
export function measureCLS(): Promise<number | null> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !("PerformanceObserver" in window)) {
      resolve(null);
      return;
    }

    try {
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
      });

      observer.observe({ entryTypes: ["layout-shift"] });

      // Report CLS when page is hidden or after 10 seconds
      const reportCLS = () => {
        reportWebVitals({ cls: clsValue });
        observer.disconnect();
        resolve(clsValue);
      };

      // Report on page hide
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden") {
          reportCLS();
        }
      });

      // Timeout after 10 seconds
      setTimeout(reportCLS, 10000);
    } catch (error) {
      console.error("Error measuring CLS:", error);
      resolve(null);
    }
  });
}

/**
 * Measure First Input Delay (FID)
 * Target: < 100ms
 */
export function measureFID(): Promise<number | null> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !("PerformanceObserver" in window)) {
      resolve(null);
      return;
    }

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const firstInput = entries[0] as PerformanceEntry & {
          processingStart?: number;
        };

        if (firstInput && firstInput.processingStart) {
          const fid = firstInput.processingStart - firstInput.startTime;
          reportWebVitals({ fid });
          observer.disconnect();
          resolve(fid);
        }
      });

      observer.observe({ entryTypes: ["first-input"] });

      // Timeout after 30 seconds (user might not interact)
      setTimeout(() => {
        observer.disconnect();
        resolve(null);
      }, 30000);
    } catch (error) {
      console.error("Error measuring FID:", error);
      resolve(null);
    }
  });
}

/**
 * Initialize all performance measurements
 */
export function initPerformanceMonitoring() {
  if (typeof window === "undefined") return;

  // Measure all Core Web Vitals
  measureFCP();
  measureLCP();
  measureTTI();
  measureCLS();
  measureFID();
}

/**
 * Check if performance targets are met
 */
export async function checkPerformanceTargets(): Promise<{
  fcp: { value: number | null; target: number; passed: boolean };
  lcp: { value: number | null; target: number; passed: boolean };
  tti: { value: number | null; target: number; passed: boolean };
}> {
  const fcp = await measureFCP();
  const lcp = await measureLCP();
  const tti = await measureTTI();

  return {
    fcp: {
      value: fcp,
      target: 1500, // 1.5s in ms
      passed: fcp !== null && fcp < 1500,
    },
    lcp: {
      value: lcp,
      target: 2500, // 2.5s in ms
      passed: lcp !== null && lcp < 2500,
    },
    tti: {
      value: tti,
      target: 3500, // 3.5s in ms
      passed: tti !== null && tti < 3500,
    },
  };
}
