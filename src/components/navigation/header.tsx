"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Menu } from "lucide-react";
import { useUIStore } from "@/store/ui";
import { useWatchlistStore } from "@/store/watchlist";
import { SearchBar } from "./search-bar";
import { ThemeToggle } from "./theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  const { toggleMobileNav } = useUIStore();
  const getWatchlistCount = useWatchlistStore(
    (state) => state.getWatchlistCount,
  );
  const [watchlistCount, setWatchlistCount] = useState(0);

  // Update watchlist count with 1 second debounce
  useEffect(() => {
    const updateCount = () => {
      setWatchlistCount(getWatchlistCount());
    };

    // Initial count
    updateCount();

    // Subscribe to watchlist changes with debounce
    let timeoutId: NodeJS.Timeout;
    const unsubscribe = useWatchlistStore.subscribe(() => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateCount, 1000);
    });

    return () => {
      clearTimeout(timeoutId);
      unsubscribe();
    };
  }, [getWatchlistCount]);

  // Format watchlist count badge
  const formatCount = (count: number): string => {
    return count > 999 ? "999+" : count.toString();
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        className,
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center space-x-2 text-xl font-bold tracking-tight transition-colors hover:text-primary"
          >
            <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
              CodeNime
            </span>
          </Link>

          {/* Desktop Navigation - Hidden on mobile (< 768px) */}
          <nav className="hidden md:flex items-center gap-6 flex-1 justify-center">
            <Link
              href="/"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Home
            </Link>
            <Link
              href="/browse"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Browse
            </Link>
            <Link
              href="/watchlist"
              className="text-sm font-medium transition-colors hover:text-primary relative"
            >
              Watchlist
              {watchlistCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-2 -right-6 h-5 min-w-5 px-1 text-xs"
                >
                  {formatCount(watchlistCount)}
                </Badge>
              )}
            </Link>
          </nav>

          {/* Search Bar - Desktop only */}
          <div className="hidden md:block flex-1 max-w-md">
            <SearchBar />
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Mobile Search Icon */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Mobile Menu Button - Only visible on mobile (< 768px) */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={toggleMobileNav}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
