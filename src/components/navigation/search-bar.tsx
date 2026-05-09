"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  placeholder?: string;
  className?: string;
}

export function SearchBar({
  placeholder = "Search anime...",
  className,
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");

  // Debounce search query by 500ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  // Handle search execution
  useEffect(() => {
    if (debouncedQuery.trim() === "") {
      setValidationMessage("");
      setIsSearching(false);
      return;
    }

    // Validate minimum 3 characters
    if (debouncedQuery.trim().length < 3) {
      setValidationMessage("Enter at least 3 characters");
      setIsSearching(false);
      return;
    }

    // Clear validation and execute search
    setValidationMessage("");
    setIsSearching(true);

    // Navigate to search results page
    router.push(`/search?q=${encodeURIComponent(debouncedQuery.trim())}`);

    // Reset loading state after navigation
    setTimeout(() => setIsSearching(false), 1000);
  }, [debouncedQuery, router]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setQuery(value);

      // Show loading indicator immediately when typing
      if (value.trim().length >= 3) {
        setIsSearching(true);
      }
    },
    [],
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      // Validate minimum 3 characters
      if (query.trim().length < 3) {
        setValidationMessage("Enter at least 3 characters");
        return;
      }

      // Trigger immediate search
      setDebouncedQuery(query);
    },
    [query],
  );

  return (
    <div className={cn("relative w-full", className)}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={handleInputChange}
            className={cn(
              "pl-9 pr-9",
              validationMessage &&
                "border-destructive focus-visible:ring-destructive",
            )}
            aria-label="Search anime"
            aria-invalid={!!validationMessage}
            aria-describedby={validationMessage ? "search-error" : undefined}
          />
          {isSearching && (
            <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
          )}
        </div>
      </form>

      {/* Validation Message */}
      {validationMessage && (
        <p
          id="search-error"
          className="mt-1 text-xs text-destructive"
          role="alert"
        >
          {validationMessage}
        </p>
      )}
    </div>
  );
}
