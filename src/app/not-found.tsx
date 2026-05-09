"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-md">
        {/* 404 Text */}
        <div className="space-y-2">
          <h1 className="text-8xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
            404
          </h1>
          <h2 className="text-3xl font-bold">Anime Not Found</h2>
        </div>

        {/* Description */}
        <p className="text-muted-foreground text-lg">
          The anime you're looking for doesn't exist or has been removed.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Button asChild size="lg" className="min-h-[44px]">
            <Link href="/">
              <Home className="size-5" />
              Return to Home
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="min-h-[44px]">
            <Link href="/search">
              <Search className="size-5" />
              Search Anime
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
