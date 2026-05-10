"use client";

import { useState } from "react";
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
  // Subscribe to items array so component re-renders when watchlist changes
  const watchlistItems = useWatchlistStore((state) => state.items);
  const watchlistCount = watchlistItems.length;
  const [showSearch, setShowSearch] = useState(false);

  // Format watchlist count badge
  const formatCount = (count: number): string => {
    return count > 999 ? "999+" : count.toString();
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        className,
      )}
      role="banner"
      style={{ position: "fixed" }}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo - Also functions as Home */}
          <Link
            href="/"
            className="flex items-center space-x-2 text-xl font-bold tracking-tight transition-colors hover:text-primary shrink-0"
            aria-label="CodeNime home"
          >
            <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
              CodeNime
            </span>
          </Link>

          {/* Desktop Navigation - Hidden on mobile (< 768px) */}
          <nav
            className="hidden md:flex items-center gap-6"
            aria-label="Main navigation"
          >
            <Link
              href="/popular"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Popular
            </Link>
            <Link
              href="/seasonal"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Seasonal
            </Link>
            <Link
              href="/upcoming"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Upcoming
            </Link>

            <Link
              href="/filter"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Filter
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
                  aria-label={`${formatCount(watchlistCount)} items in watchlist`}
                >
                  {formatCount(watchlistCount)}
                </Badge>
              )}
            </Link>
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            {/* Desktop Search Bar */}
            <div className="hidden md:block w-64">
              <SearchBar />
            </div>

            {/* Mobile Search Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setShowSearch(!showSearch)}
              aria-label="Toggle search"
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Mobile Menu Button - Only visible on mobile (< 768px) */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={toggleMobileNav}
              aria-label="Open navigation menu"
              aria-expanded={false}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {showSearch && (
          <div className="md:hidden pb-4">
            <SearchBar />
          </div>
        )}
      </div>
    </header>
  );
}
