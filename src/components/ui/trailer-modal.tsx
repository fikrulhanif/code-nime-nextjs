"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { useUIStore } from "@/store/ui";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function TrailerModal() {
  const { trailerModal, closeTrailerModal } = useUIStore();
  const [videoId, setVideoId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [embedError, setEmbedError] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Extract YouTube video ID from URL
  useEffect(() => {
    if (trailerModal.trailerUrl) {
      const extractedId = extractYouTubeId(trailerModal.trailerUrl);
      setVideoId(extractedId);
      setIsLoading(true);
      setEmbedError(false);
    } else {
      setVideoId(null);
    }
  }, [trailerModal.trailerUrl]);

  // Set loading timeout
  useEffect(() => {
    if (trailerModal.isOpen && videoId) {
      const timeout = setTimeout(() => {
        if (isLoading) {
          setEmbedError(true);
          setIsLoading(false);
        }
      }, 10000); // 10 second timeout

      return () => clearTimeout(timeout);
    }
  }, [trailerModal.isOpen, videoId, isLoading]);

  const handleClose = () => {
    // Pause video by reloading iframe
    if (iframeRef.current) {
      iframeRef.current.src = "";
    }
    closeTrailerModal();
    setIsLoading(true);
    setEmbedError(false);
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleIframeError = () => {
    setEmbedError(true);
    setIsLoading(false);
  };

  const openInYouTube = () => {
    if (trailerModal.trailerUrl) {
      window.open(trailerModal.trailerUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <Dialog open={trailerModal.isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl w-full p-0 bg-black border-white/10">
        <DialogHeader className="sr-only">
          <DialogTitle>{trailerModal.animeTitle} - Trailer</DialogTitle>
        </DialogHeader>

        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm transition-colors"
          aria-label="Close trailer"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Video container */}
        <div className="relative w-full aspect-video bg-black">
          {isLoading && !embedError && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                <p className="text-white text-sm">Loading trailer...</p>
              </div>
            </div>
          )}

          {embedError ? (
            <div className="absolute inset-0 flex items-center justify-center p-8">
              <div className="text-center">
                <p className="text-white text-lg mb-4">Trailer unavailable</p>
                <button
                  onClick={openInYouTube}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                >
                  Open in YouTube
                </button>
              </div>
            </div>
          ) : (
            videoId && (
              <iframe
                ref={iframeRef}
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
                title={`${trailerModal.animeTitle} Trailer`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                onLoad={handleIframeLoad}
                onError={handleIframeError}
                className="w-full h-full"
              />
            )
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Extract YouTube video ID from various URL formats
function extractYouTubeId(url: string): string | null {
  if (!url) return null;

  // Handle embed URLs
  if (url.includes("youtube.com/embed/")) {
    const match = url.match(/youtube\.com\/embed\/([^?&]+)/);
    return match ? match[1] : null;
  }

  // Handle watch URLs
  if (url.includes("youtube.com/watch")) {
    const match = url.match(/[?&]v=([^&]+)/);
    return match ? match[1] : null;
  }

  // Handle short URLs
  if (url.includes("youtu.be/")) {
    const match = url.match(/youtu\.be\/([^?&]+)/);
    return match ? match[1] : null;
  }

  return null;
}
