"use client";

// Providers wrapper for QueryClientProvider and other global providers

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query/client";
import { ReactNode } from "react";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
