"use client";

import { useQuery } from "@tanstack/react-query";
import {
  fetchAnimeDetails,
  fetchAnimeCharacters,
  fetchAnimeEpisodes,
  fetchAnimeRecommendations,
} from "@/lib/api/anilist";
import { DetailSkeleton } from "@/components/loading/detail-skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AnimeCard } from "@/components/anime/anime-card";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { useWatchlistStore } from "@/store/watchlist";
import { useUIStore } from "@/store/ui";
import { Play, Plus, Check } from "lucide-react";
import { useState, useEffect } from "react";

interface AnimeDetailClientProps {
  animeId: number;
}

export default function AnimeDetailClient({ animeId }: AnimeDetailClientProps) {
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } =
    useWatchlistStore();
  const { openTrailerModal } = useUIStore();
  const [isInList, setIsInList] = useState(false);

  // Fetch anime details
  const {
    data: anime,
    isLoading: isLoadingDetails,
    error: detailsError,
  } = useQuery({
    queryKey: ["anime", animeId],
    queryFn: () => fetchAnimeDetails(animeId),
    enabled: !isNaN(animeId) && animeId > 0,
  });

  // Fetch characters
  const {
    data: charactersData = [],
    isLoading: isLoadingCharacters,
    error: charactersError,
  } = useQuery({
    queryKey: ["anime", animeId, "characters"],
    queryFn: async () => {
      const data = await fetchAnimeCharacters(animeId);
      console.log("Characters data:", data);
      return data;
    },
    enabled: !isNaN(animeId) && animeId > 0,
  });

  // Extract characters from response
  const characters = charactersData || [];

  // Fetch episodes
  const {
    data: episodesData,
    isLoading: isLoadingEpisodes,
    error: episodesError,
  } = useQuery({
    queryKey: ["anime", animeId, "episodes"],
    queryFn: () => fetchAnimeEpisodes(animeId, 1),
    enabled: !isNaN(animeId) && animeId > 0,
  });

  const episodes = episodesData?.data || [];

  // Fetch recommendations
  const { data: recommendations = [], isLoading: isLoadingRecommendations } =
    useQuery({
      queryKey: ["anime", animeId, "recommendations"],
      queryFn: () => fetchAnimeRecommendations(animeId),
      enabled: !isNaN(animeId) && animeId > 0,
    });

  // Check if anime is in watchlist
  useEffect(() => {
    if (anime) {
      setIsInList(isInWatchlist(anime.mal_id));
    }
  }, [anime, isInWatchlist]);

  // Handle watchlist toggle
  const handleWatchlistToggle = () => {
    if (!anime) return;

    setIsInList(!isInList);

    if (isInList) {
      removeFromWatchlist(anime.mal_id);
    } else {
      addToWatchlist(anime);
    }
  };

  // Handle trailer button click
  const handleWatchTrailer = () => {
    const trailerUrl = anime?.trailer?.url || anime?.trailer?.embed_url;
    if (trailerUrl) {
      openTrailerModal(trailerUrl, anime.title);
    }
  };

  // Format value or show N/A
  const formatValue = (value: string | number | null | undefined): string => {
    if (value === null || value === undefined || value === "") {
      return "N/A";
    }
    return String(value);
  };

  // Extract YouTube video ID from URL
  const getYouTubeId = (url: string | null): string | null => {
    if (!url) return null;

    console.log("Extracting YouTube ID from URL:", url);

    // Handle embed URLs (including youtube-nocookie.com)
    if (
      url.includes("youtube.com/embed/") ||
      url.includes("youtube-nocookie.com/embed/")
    ) {
      const match = url.match(/\/embed\/([^?&]+)/);
      const id = match ? match[1] : null;
      console.log("Extracted ID (embed):", id);
      return id;
    }

    // Handle watch URLs
    if (url.includes("youtube.com/watch")) {
      const match = url.match(/[?&]v=([^&]+)/);
      const id = match ? match[1] : null;
      console.log("Extracted ID (watch):", id);
      return id;
    }

    // Handle short URLs
    if (url.includes("youtu.be/")) {
      const match = url.match(/youtu\.be\/([^?&]+)/);
      const id = match ? match[1] : null;
      console.log("Extracted ID (short):", id);
      return id;
    }

    console.log("Could not extract YouTube ID");
    return null;
  };

  // Get YouTube thumbnail as backdrop (maxresdefault for best quality)
  const getBackdropUrl = (): string | null => {
    console.log("Getting backdrop URL, trailer:", anime?.trailer);
    // Try to get YouTube ID from url or embed_url
    const trailerUrl = anime?.trailer?.url || anime?.trailer?.embed_url || null;
    const youtubeId = getYouTubeId(trailerUrl);
    if (youtubeId) {
      const thumbnailUrl = `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
      console.log("Using YouTube thumbnail:", thumbnailUrl);
      return thumbnailUrl;
    }
    // Fallback to anime image (will be blurry for landscape)
    const fallback =
      anime?.images?.jpg?.large_image_url ||
      anime?.images?.jpg?.image_url ||
      null;
    console.log("Using fallback image:", fallback);
    return fallback;
  };

  // Get poster image URL
  const getPosterUrl = (): string => {
    return (
      anime?.images?.jpg?.large_image_url ||
      anime?.images?.jpg?.image_url ||
      "/placeholder-anime.svg"
    );
  };

  // Show loading skeleton
  if (isLoadingDetails) {
    return <DetailSkeleton />;
  }

  // Handle error or invalid ID
  if (detailsError || !anime) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Anime not found</h1>
          <p className="text-muted-foreground">
            The anime you're looking for doesn't exist or couldn't be loaded.
          </p>
          <Button onClick={() => window.history.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  const backdropUrl = getBackdropUrl();
  const hasTrailer = anime.trailer?.url || anime.trailer?.embed_url;
  const trailerYouTubeId = getYouTubeId(
    anime.trailer?.url || anime.trailer?.embed_url || null,
  );

  console.log("Anime detail render:", {
    animeId: anime.mal_id,
    title: anime.title,
    hasTrailer,
    trailerUrl: anime.trailer?.url,
    trailerEmbedUrl: anime.trailer?.embed_url,
    trailerYouTubeId,
    backdropUrl,
  });

  return (
    <div className="w-full">
      {/* Hero Section */}
      <div className="relative min-h-[400px] w-full overflow-hidden md:min-h-[500px]">
        {/* Backdrop Image or Gradient Fallback */}
        {backdropUrl ? (
          <div className="absolute inset-0 h-full w-full">
            <OptimizedImage
              src={backdropUrl}
              alt={anime.title}
              fill
              className="object-cover"
              priority
              sizes="100vw"
              showBlurPlaceholder={true}
            />
          </div>
        ) : (
          <div className="absolute inset-0 h-full w-full bg-gradient-to-br from-purple-900 via-purple-700 to-pink-600" />
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />

        {/* Content */}
        <div className="relative z-10 flex h-full items-end px-4 pb-8 md:px-8 md:pb-12 lg:px-16">
          <div className="flex w-full flex-col gap-6 md:flex-row md:items-end">
            {/* Poster Image */}
            <div className="relative h-[300px] w-[200px] shrink-0 overflow-hidden rounded-lg shadow-2xl md:h-[400px] md:w-[280px]">
              <OptimizedImage
                src={getPosterUrl()}
                alt={anime.title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 200px, 280px"
                showBlurPlaceholder={true}
              />
            </div>

            {/* Info */}
            <div className="flex-1 space-y-4">
              {/* Title */}
              <div className="space-y-2">
                <h1 className="text-3xl font-bold leading-tight md:text-5xl">
                  {anime.title}
                </h1>
                {anime.title_english && anime.title_english !== anime.title && (
                  <p className="text-lg text-muted-foreground md:text-xl">
                    {anime.title_english}
                  </p>
                )}
              </div>

              {/* Metadata Badges */}
              <div className="flex flex-wrap gap-3">
                <Badge variant="secondary" className="text-sm">
                  {anime.score ? `${anime.score.toFixed(2)}/10` : "N/A"}
                </Badge>
                <Badge variant="outline" className="text-sm capitalize">
                  {formatValue(anime.type)}
                </Badge>
                <Badge variant="outline" className="text-sm capitalize">
                  {formatValue(anime.status)}
                </Badge>
                {anime.year && (
                  <Badge variant="outline" className="text-sm">
                    {anime.year}
                  </Badge>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                {hasTrailer && (
                  <Button
                    onClick={handleWatchTrailer}
                    size="lg"
                    className="min-h-[44px]"
                  >
                    <Play className="size-5" />
                    Watch Trailer
                  </Button>
                )}
                <Button
                  onClick={handleWatchlistToggle}
                  variant={isInList ? "secondary" : "default"}
                  size="lg"
                  className="min-h-[44px]"
                >
                  {isInList ? (
                    <>
                      <Check className="size-5" />
                      In Watchlist
                    </>
                  ) : (
                    <>
                      <Plus className="size-5" />
                      Add to Watchlist
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 lg:px-16">
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          {/* Left Column - Main Content */}
          <div className="space-y-8">
            {/* Synopsis */}
            {anime.synopsis && (
              <section className="space-y-4">
                <h2 className="text-2xl font-bold">Synopsis</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {anime.synopsis}
                </p>
              </section>
            )}

            {/* Trailer */}
            {hasTrailer && trailerYouTubeId && (
              <section className="space-y-4">
                <h2 className="text-2xl font-bold">Trailer</h2>
                <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
                  <iframe
                    src={`https://www.youtube.com/embed/${trailerYouTubeId}`}
                    title={`${anime.title} Trailer`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 h-full w-full"
                  />
                </div>
              </section>
            )}

            {/* Characters */}
            {characters.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-2xl font-bold">Characters</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {characters.slice(0, 12).map((item, index) => {
                    const character = item.character || item;
                    const characterId = character.mal_id || index;

                    return (
                      <div
                        key={`character-${characterId}-${index}`}
                        className="flex gap-3 rounded-lg border border-border/50 bg-card p-3"
                      >
                        {/* Character Image */}
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
                          <OptimizedImage
                            src={
                              character.images?.jpg?.image_url ||
                              "/placeholder-character.svg"
                            }
                            alt={character.name}
                            fill
                            className="object-cover"
                            sizes="64px"
                            showBlurPlaceholder={true}
                          />
                        </div>

                        {/* Character Info */}
                        <div className="flex-1 space-y-1 overflow-hidden">
                          <p className="text-sm font-medium leading-tight line-clamp-2">
                            {character.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {item.role}
                          </p>
                          {item.voice_actors &&
                            item.voice_actors.length > 0 && (
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                {item.voice_actors[0].name}
                              </p>
                            )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {isLoadingCharacters && (
                  <div className="flex justify-center py-4">
                    <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                  </div>
                )}
                {charactersError && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Failed to load characters
                  </p>
                )}
              </section>
            )}

            {/* Episodes */}
            {episodes.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Episodes</h2>
                  {episodesData?.pagination?.has_next_page && (
                    <p className="text-sm text-muted-foreground">
                      Showing {episodes.length} of{" "}
                      {episodesData.pagination.items.total} episodes
                    </p>
                  )}
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {episodes.map((episode) => (
                    <div
                      key={episode.mal_id}
                      className="flex flex-col gap-2 rounded-lg border border-border/50 bg-card p-4 hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              Ep {episode.mal_id}
                            </Badge>
                            {episode.filler && (
                              <Badge variant="outline" className="text-xs">
                                Filler
                              </Badge>
                            )}
                            {episode.recap && (
                              <Badge variant="outline" className="text-xs">
                                Recap
                              </Badge>
                            )}
                          </div>
                          <h3 className="text-sm font-medium leading-tight line-clamp-2">
                            {episode.title || `Episode ${episode.mal_id}`}
                          </h3>
                          {episode.title_japanese && (
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {episode.title_japanese}
                            </p>
                          )}
                        </div>
                        {episode.score && episode.score > 0 && (
                          <Badge
                            variant="secondary"
                            className="text-xs shrink-0"
                          >
                            ⭐ {episode.score.toFixed(1)}
                          </Badge>
                        )}
                      </div>
                      {episode.aired && (
                        <p className="text-xs text-muted-foreground">
                          Aired: {new Date(episode.aired).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
                {isLoadingEpisodes && (
                  <div className="flex justify-center py-4">
                    <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                  </div>
                )}
                {episodesError && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Failed to load episodes
                  </p>
                )}
              </section>
            )}

            {/* Recommendations */}
            {recommendations.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Recommendations</h2>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {recommendations.slice(0, 12).map((rec) => (
                    <AnimeCard
                      key={rec.mal_id}
                      anime={rec}
                      variant="compact"
                      showWatchlistButton={false}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right Column - Information Sidebar */}
          <div className="space-y-6">
            {/* Information Card */}
            <div className="rounded-lg border border-border/50 bg-card p-6 space-y-6">
              <h2 className="text-xl font-bold">Information</h2>

              {/* Score */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Score
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">
                    {anime.score ? anime.score.toFixed(2) : "N/A"}
                  </span>
                  <span className="text-sm text-muted-foreground">/10</span>
                </div>
                {anime.scored_by && (
                  <p className="text-xs text-muted-foreground">
                    {anime.scored_by.toLocaleString()} users
                  </p>
                )}
              </div>

              <div className="border-t border-border/50" />

              {/* Ranking */}
              {anime.rank && (
                <>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      Ranking
                    </p>
                    <p className="text-lg font-semibold">#{anime.rank}</p>
                  </div>
                  <div className="border-t border-border/50" />
                </>
              )}

              {/* Type */}
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Type
                </p>
                <p className="text-lg font-semibold capitalize">
                  {formatValue(anime.type)}
                </p>
              </div>

              <div className="border-t border-border/50" />

              {/* Episodes */}
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Episodes
                </p>
                <p className="text-lg font-semibold">
                  {formatValue(anime.episodes)}
                </p>
              </div>

              <div className="border-t border-border/50" />

              {/* Status */}
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Status
                </p>
                <p className="text-lg font-semibold capitalize">
                  {formatValue(anime.status)}
                </p>
              </div>

              <div className="border-t border-border/50" />

              {/* Aired */}
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Aired
                </p>
                <p className="text-sm font-semibold">
                  {formatValue(anime.aired?.string)}
                </p>
              </div>

              {/* Duration */}
              {anime.duration && (
                <>
                  <div className="border-t border-border/50" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      Duration
                    </p>
                    <p className="text-sm font-semibold">
                      {formatValue(anime.duration)}
                    </p>
                  </div>
                </>
              )}

              {/* Rating */}
              {anime.rating && (
                <>
                  <div className="border-t border-border/50" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      Rating
                    </p>
                    <p className="text-sm font-semibold">
                      {formatValue(anime.rating)}
                    </p>
                  </div>
                </>
              )}

              {/* Source */}
              {anime.source && (
                <>
                  <div className="border-t border-border/50" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      Source
                    </p>
                    <p className="text-sm font-semibold capitalize">
                      {formatValue(anime.source)}
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Genres */}
            {anime.genres && anime.genres.length > 0 && (
              <div className="rounded-lg border border-border/50 bg-card p-6 space-y-4">
                <h2 className="text-xl font-bold">Genres</h2>
                <div className="flex flex-wrap gap-2">
                  {anime.genres.map((genre) => (
                    <Badge
                      key={genre.mal_id}
                      variant="secondary"
                      className="text-sm px-3 py-1"
                    >
                      {genre.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Studios */}
            {anime.studios && anime.studios.length > 0 && (
              <div className="rounded-lg border border-border/50 bg-card p-6 space-y-4">
                <h2 className="text-xl font-bold">Studios</h2>
                <div className="flex flex-wrap gap-2">
                  {anime.studios.map((studio) => (
                    <Badge
                      key={studio.mal_id}
                      variant="outline"
                      className="text-sm px-3 py-1"
                    >
                      {studio.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
