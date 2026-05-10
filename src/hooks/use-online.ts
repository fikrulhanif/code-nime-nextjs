/**
 * Hook for detecting online/offline status
 * Requirement 24.1: Display offline indicator within 2s of connection loss
 */

import { useEffect, useState } from "react";
import { toast } from "sonner";

export function useOnline() {
  const [isOnline, setIsOnline] = useState(
    typeof window !== "undefined" ? navigator.onLine : true,
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    let offlineTimeout: NodeJS.Timeout;
    let onlineTimeout: NodeJS.Timeout;

    const handleOffline = () => {
      // Requirement 24.1: Display indicator within 2s
      offlineTimeout = setTimeout(() => {
        setIsOnline(false);
        // Requirement 24.5: Display toast on connection loss
        toast.error("Network error. Check your connection.", {
          duration: Infinity,
          id: "offline-toast",
        });
      }, 2000);
    };

    const handleOnline = () => {
      // Clear offline timeout if connection restored quickly
      if (offlineTimeout) {
        clearTimeout(offlineTimeout);
      }

      // Requirement 24.7: Hide indicator within 2s of connection restore
      onlineTimeout = setTimeout(() => {
        setIsOnline(true);
        toast.dismiss("offline-toast");
        toast.success("Connection restored", {
          duration: 3000,
        });
      }, 2000);
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
      if (offlineTimeout) clearTimeout(offlineTimeout);
      if (onlineTimeout) clearTimeout(onlineTimeout);
    };
  }, []);

  return isOnline;
}
