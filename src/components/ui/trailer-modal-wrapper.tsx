"use client";

import dynamic from "next/dynamic";

// Dynamically import TrailerModal for code splitting
// Requirement 20.5: Load trailer modal within 500ms of "Watch Trailer" click
const TrailerModal = dynamic(
  () =>
    import("@/components/ui/trailer-modal").then((mod) => ({
      default: mod.TrailerModal,
    })),
  {
    ssr: false,
    loading: () => null,
  },
);

export function TrailerModalWrapper() {
  return <TrailerModal />;
}
