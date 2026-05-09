import { cn } from "@/lib/utils";
import { Spinner } from "./spinner";

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  className?: string;
}

export function LoadingOverlay({
  isLoading,
  message,
  className,
}: LoadingOverlayProps) {
  if (!isLoading) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm",
        className,
      )}
      role="progressbar"
      aria-label={message || "Loading"}
      aria-busy="true"
    >
      <div className="flex flex-col items-center gap-4 rounded-lg border border-border/50 bg-card p-8 shadow-lg">
        <Spinner size="lg" />
        {message && (
          <p className="text-sm font-medium text-muted-foreground">{message}</p>
        )}
      </div>
    </div>
  );
}
