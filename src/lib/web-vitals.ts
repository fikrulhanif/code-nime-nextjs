/**
 * Web Vitals reporting for Core Web Vitals monitoring
 * Requirements 20.1, 20.2, 20.3: Monitor FCP, LCP, TTI
 */

import { onCLS, onFCP, onLCP, onTTFB, onINP } from "web-vitals";

/**
 * Report Web Vitals to console and analytics
 */
export function reportWebVitals() {
  if (typeof window === "undefined") return;

  // First Contentful Paint (FCP) - Target: < 1.5s
  onFCP((metric) => {
    const value = metric.value;
    const target = 1500; // 1.5s in ms
    const passed = value < target;

    console.log(
      `[Web Vitals] FCP: ${value.toFixed(0)}ms (Target: ${target}ms) - ${passed ? "✓ PASS" : "✗ FAIL"}`,
    );

    // Send to analytics in production
    if (process.env.NODE_ENV === "production") {
      // Example: sendToAnalytics({ metric: 'FCP', value, passed });
    }
  });

  // Largest Contentful Paint (LCP) - Target: < 2.5s
  onLCP((metric) => {
    const value = metric.value;
    const target = 2500; // 2.5s in ms
    const passed = value < target;

    console.log(
      `[Web Vitals] LCP: ${value.toFixed(0)}ms (Target: ${target}ms) - ${passed ? "✓ PASS" : "✗ FAIL"}`,
    );

    if (process.env.NODE_ENV === "production") {
      // Example: sendToAnalytics({ metric: 'LCP', value, passed });
    }
  });

  // Interaction to Next Paint (INP) - Target: < 200ms
  // Note: INP replaced FID in web-vitals v4
  onINP((metric) => {
    const value = metric.value;
    const target = 200; // 200ms
    const passed = value < target;

    console.log(
      `[Web Vitals] INP: ${value.toFixed(0)}ms (Target: ${target}ms) - ${passed ? "✓ PASS" : "✗ FAIL"}`,
    );

    if (process.env.NODE_ENV === "production") {
      // Example: sendToAnalytics({ metric: 'INP', value, passed });
    }
  });

  // Cumulative Layout Shift (CLS) - Target: < 0.1
  onCLS((metric) => {
    const value = metric.value;
    const target = 0.1;
    const passed = value < target;

    console.log(
      `[Web Vitals] CLS: ${value.toFixed(3)} (Target: ${target}) - ${passed ? "✓ PASS" : "✗ FAIL"}`,
    );

    if (process.env.NODE_ENV === "production") {
      // Example: sendToAnalytics({ metric: 'CLS', value, passed });
    }
  });

  // Time to First Byte (TTFB) - Target: < 600ms
  onTTFB((metric) => {
    const value = metric.value;
    const target = 600; // 600ms
    const passed = value < target;

    console.log(
      `[Web Vitals] TTFB: ${value.toFixed(0)}ms (Target: ${target}ms) - ${passed ? "✓ PASS" : "✗ FAIL"}`,
    );

    if (process.env.NODE_ENV === "production") {
      // Example: sendToAnalytics({ metric: 'TTFB', value, passed });
    }
  });
}

/**
 * Measure Time to Interactive (TTI) approximation
 * Note: TTI is not directly available in web-vitals, so we approximate it
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
        const target = 3500; // 3.5s
        const passed = tti < target;

        console.log(
          `[Web Vitals] TTI: ${tti.toFixed(0)}ms (Target: ${target}ms) - ${passed ? "✓ PASS" : "✗ FAIL"}`,
        );

        resolve(tti);
        return;
      }

      // Wait for load event
      window.addEventListener("load", () => {
        // Use a small delay to ensure all scripts have executed
        setTimeout(() => {
          const tti = performance.now();
          const target = 3500; // 3.5s
          const passed = tti < target;

          console.log(
            `[Web Vitals] TTI: ${tti.toFixed(0)}ms (Target: ${target}ms) - ${passed ? "✓ PASS" : "✗ FAIL"}`,
          );

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
