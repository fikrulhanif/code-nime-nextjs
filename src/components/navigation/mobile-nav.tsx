"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { useUIStore } from "@/store/ui";
import { useWatchlistStore } from "@/store/watchlist";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  className?: string;
}

export function MobileNav({ className }: MobileNavProps) {
  const pathname = usePathname();
  const { mobileNavOpen, toggleMobileNav } = useUIStore();
  // Subscribe to items array so component re-renders when watchlist changes
  const watchlistItems = useWatchlistStore((state) => state.items);
  const watchlistCount = watchlistItems.length;

  // Close drawer on route change (only if it's open)
  useEffect(() => {
    if (mobileNavOpen) {
      toggleMobileNav();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Close drawer on Escape key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileNavOpen) {
        toggleMobileNav();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [mobileNavOpen, toggleMobileNav]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (mobileNavOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileNavOpen]);

  // Format watchlist count badge
  const formatCount = (count: number): string => {
    return count > 999 ? "999+" : count.toString();
  };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/popular", label: "Popular" },
    { href: "/seasonal", label: "Seasonal" },
    { href: "/upcoming", label: "Upcoming" },
    { href: "/filter", label: "Filter" },
    { href: "/search", label: "Search" },
    {
      href: "/watchlist",
      label: "Watchlist",
      badge: watchlistCount > 0 ? formatCount(watchlistCount) : null,
    },
  ];

  return (
    <Sheet open={mobileNavOpen} onOpenChange={toggleMobileNav}>
      <SheetContent
        side="left"
        className={cn(
          "w-[300px] sm:w-[400px] transition-transform duration-300",
          className,
        )}
      >
        <SheetHeader>
          <SheetTitle className="text-left">
            <Link
              href="/"
              className="flex items-center space-x-2"
              onClick={toggleMobileNav}
            >
              <span className="text-2xl font-black tracking-tighter bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 bg-clip-text text-transparent">
                CodeNime
              </span>
            </Link>
          </SheetTitle>
          <SheetClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </SheetClose>
        </SheetHeader>

        <nav
          className="mt-8 flex flex-col space-y-4"
          aria-label="Mobile navigation"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center justify-between rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 hover:bg-accent hover:text-accent-foreground hover:translate-x-1",
                pathname === link.href && "bg-accent text-accent-foreground",
              )}
              onClick={toggleMobileNav}
            >
              <span>{link.label}</span>
              {link.badge && (
                <Badge
                  variant="destructive"
                  className="h-5 min-w-5 px-2 text-xs"
                  aria-label={`${link.badge} items in watchlist`}
                >
                  {link.badge}
                </Badge>
              )}
            </Link>
          ))}

          {/* GitHub Link */}
          <div className="pt-4 border-t">
            <Button variant="outline" className="w-full justify-start" asChild>
              <a
                href="https://github.com/fikrulhanif"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <svg
                  className="h-4 w-4"
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
                <span>GitHub Profile</span>
              </a>
            </Button>
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
