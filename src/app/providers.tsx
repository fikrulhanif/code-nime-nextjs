"use client";

// Providers wrapper for QueryClientProvider and other global providers

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query/client";
import { ReactNode, useEffect } from "react";
import { useUIStore } from "@/store/ui";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const initTheme = useUIStore((state) => state.initTheme);

  useEffect(() => {
    // Initialize theme on mount to ensure it's applied
    initTheme();

    // Requirement 24.6: Auto-refetch all active queries within 5s of connection restore
    const handleOnline = () => {
      setTimeout(() => {
        queryClient.refetchQueries({ type: "active" });
      }, 5000);
    };

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [initTheme]);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
