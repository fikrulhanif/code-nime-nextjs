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
import { cn } from "@/lib/utils";

interface MobileNavProps {
  className?: string;
}

export function MobileNav({ className }: MobileNavProps) {
  const pathname = usePathname();
  const { mobileNavOpen, toggleMobileNav } = useUIStore();
  const getWatchlistCount = useWatchlistStore(
    (state) => state.getWatchlistCount,
  );
  const watchlistCount = getWatchlistCount();

  // Close drawer on route change
  useEffect(() => {
    toggleMobileNav();
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
    { href: "/browse", label: "Browse" },
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
              className="flex items-center space-x-2 text-xl font-bold tracking-tight"
              onClick={toggleMobileNav}
            >
              <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                CodeNime
              </span>
            </Link>
          </SheetTitle>
          <SheetClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </SheetClose>
        </SheetHeader>

        <nav className="mt-8 flex flex-col space-y-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center justify-between rounded-lg px-4 py-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                pathname === link.href && "bg-accent text-accent-foreground",
              )}
              onClick={toggleMobileNav}
            >
              <span>{link.label}</span>
              {link.badge && (
                <Badge
                  variant="destructive"
                  className="h-5 min-w-5 px-2 text-xs"
                >
                  {link.badge}
                </Badge>
              )}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
