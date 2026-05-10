"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
  const [validationMessage, setValidationMessage] = useState("");

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setQuery(value);
      setValidationMessage(""); // Clear validation on input
    },
    [],
  );

  const handleSearch = useCallback(() => {
    const trimmedQuery = query.trim();

    // Validate minimum 3 characters
    if (trimmedQuery.length === 0) {
      setValidationMessage("Please enter a search term");
      return;
    }

    if (trimmedQuery.length < 3) {
      setValidationMessage("Enter at least 3 characters");
      return;
    }

    // Clear validation and navigate to search page
    setValidationMessage("");
    router.push(`/search?q=${encodeURIComponent(trimmedQuery)}`);
  }, [query, router]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      handleSearch();
    },
    [handleSearch],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSearch();
      }
    },
    [handleSearch],
  );

  return (
    <div className={cn("relative w-full", className)}>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className={cn(
              "pl-9",
              validationMessage &&
                "border-destructive focus-visible:ring-destructive",
            )}
            aria-label="Search anime"
            aria-invalid={!!validationMessage}
            aria-describedby={validationMessage ? "search-error" : undefined}
          />
        </div>
        <Button type="submit" size="default" className="shrink-0">
          Search
        </Button>
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
