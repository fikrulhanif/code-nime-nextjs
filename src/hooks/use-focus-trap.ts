import { useEffect, useRef } from "react";

/**
 * Custom hook for managing focus trap within a container
 * Ensures Tab navigation stays within the container until it's closed
 */
export function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive) return;

    const container = containerRef.current;
    if (!container) return;

    // Store the element that had focus before the trap was activated
    previousFocusRef.current = document.activeElement as HTMLElement;

    // Get all focusable elements within the container
    const getFocusableElements = () => {
      const focusableSelectors = [
        "a[href]",
        "button:not([disabled])",
        "textarea:not([disabled])",
        "input:not([disabled])",
        "select:not([disabled])",
        '[tabindex]:not([tabindex="-1"])',
      ].join(", ");

      return Array.from(
        container.querySelectorAll<HTMLElement>(focusableSelectors),
      ).filter((el) => {
        // Filter out elements that are not visible
        return el.offsetParent !== null;
      });
    };

    // Move focus to the first focusable element
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      // Small delay to ensure the modal is fully rendered
      setTimeout(() => {
        focusableElements[0]?.focus();
      }, 100);
    }

    // Handle Tab key navigation
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey) {
        // Shift + Tab: moving backwards
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab: moving forwards
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener("keydown", handleKeyDown);

    // Cleanup: restore focus to the previous element
    return () => {
      container.removeEventListener("keydown", handleKeyDown);

      // Restore focus when the trap is deactivated
      if (
        previousFocusRef.current &&
        document.body.contains(previousFocusRef.current)
      ) {
        previousFocusRef.current.focus();
      }
    };
  }, [isActive]);

  return containerRef;
}
