"use client";

import { useOnline } from "@/hooks/use-online";
import { WifiOff } from "lucide-react";

/**
 * Offline Indicator Component
 * Requirement 24.1: Display offline indicator in navigation within 2s
 */
export function OfflineIndicator() {
  const isOnline = useOnline();

  if (isOnline) return null;

  return (
    <div
      className="fixed top-16 left-0 right-0 z-40 bg-destructive text-destructive-foreground py-2 px-4 flex items-center justify-center gap-2 shadow-lg"
      role="alert"
      aria-live="assertive"
    >
      <WifiOff className="h-4 w-4" aria-hidden="true" />
      <span className="text-sm font-medium">
        You are offline. Some features may be unavailable.
      </span>
    </div>
  );
}
