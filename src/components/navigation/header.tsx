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
            className="flex items-center space-x-2 shrink-0 group"
            aria-label="CodeNime home"
          >
            <span className="text-3xl font-black tracking-tighter bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 bg-clip-text text-transparent hover:from-purple-500 hover:via-pink-400 hover:to-purple-500 transition-all duration-300 drop-shadow-[0_0_15px_rgba(168,85,247,0.4)] group-hover:drop-shadow-[0_0_25px_rgba(168,85,247,0.6)]">
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
              className="text-sm font-medium transition-all duration-200 hover:text-primary relative group"
            >
              <span className="relative z-10">Popular</span>
              <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left"></span>
            </Link>
            <Link
              href="/seasonal"
              className="text-sm font-medium transition-all duration-200 hover:text-primary relative group"
            >
              <span className="relative z-10">Seasonal</span>
              <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left"></span>
            </Link>
            <Link
              href="/upcoming"
              className="text-sm font-medium transition-all duration-200 hover:text-primary relative group"
            >
              <span className="relative z-10">Upcoming</span>
              <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left"></span>
            </Link>

            <Link
              href="/filter"
              className="text-sm font-medium transition-all duration-200 hover:text-primary relative group"
            >
              <span className="relative z-10">Filter</span>
              <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left"></span>
            </Link>

            <Link
              href="/watchlist"
              className="text-sm font-medium transition-all duration-200 hover:text-primary relative group"
            >
              <span className="relative z-10">Watchlist</span>
              <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left"></span>
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

            {/* GitHub Link */}
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="hover:text-primary transition-colors"
            >
              <a
                href="https://github.com/fikrulhanif"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit GitHub profile"
              >
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
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
